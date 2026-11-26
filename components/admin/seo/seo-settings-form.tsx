"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";

import { saveSeoSettingsAction } from "@/app/(admin)/admin/application/seo/actions";
import { SeoDisclosure, SeoFieldGroup } from "@/components/admin/seo/seo-disclosure";
import {
  keywordsToText,
  linesToList,
  previewTitle,
  textToKeywords,
} from "@/components/admin/seo/seo-meta";
import { CharCount } from "@/components/admin/seo/seo-previews";
import { MediaChoiceField } from "@/components/media/media-choice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { SeoOverview, SeoSettingsInput } from "@/lib/admin/seo-types";

function sameOrigin(a: string, b: string) {
  return a.trim().replace(/\/+$/, "").toLowerCase() === b.trim().replace(/\/+$/, "").toLowerCase();
}

export function SeoSettingsForm({
  overview,
  onSaved,
}: {
  overview: SeoOverview;
  onSaved: (overview: SeoOverview) => void;
}) {
  const settings = overview.settings;
  const [siteUrl, setSiteUrl] = useState(settings.site_url_setting);
  const [titlePrefix, setTitlePrefix] = useState(settings.title_prefix);
  const [titleSuffix, setTitleSuffix] = useState(settings.title_suffix);
  const [description, setDescription] = useState(settings.default_description);
  const [keywords, setKeywords] = useState(keywordsToText(settings.default_keywords));
  const [author, setAuthor] = useState(settings.default_author);
  const [ogImage, setOgImage] = useState(settings.default_og_image);
  const [ogLocale, setOgLocale] = useState(settings.og_locale);
  const [twitterSite, setTwitterSite] = useState(settings.twitter_site);
  const [twitterCreator, setTwitterCreator] = useState(settings.twitter_creator);
  const [disallow, setDisallow] = useState(settings.robots_disallow.join("\n"));
  const [robotsExtra, setRobotsExtra] = useState(settings.robots_extra);
  const [allowAi, setAllowAi] = useState(settings.allow_ai_crawlers);
  const [llms, setLlms] = useState(settings.llms_enabled);
  const [entityType, setEntityType] = useState(settings.entity_type);
  const [sameAs, setSameAs] = useState(settings.same_as.join("\n"));
  const [contactEmail, setContactEmail] = useState(settings.contact_email ?? "");
  const [tagline, setTagline] = useState(settings.tagline ?? "");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const siteUrlChanged = !sameOrigin(siteUrl || settings.site_url_fallback, settings.site_url);
  const sample = previewTitle(
    { meta_title: "About", title_affix_mode: "inherit", title_prefix: null, title_suffix: null },
    { title_prefix: titlePrefix, title_suffix: titleSuffix, identity: settings.identity },
    "About",
  );

  function save() {
    const input: SeoSettingsInput = {
      site_url: siteUrl.trim() === "" ? null : siteUrl.trim(),
      title_prefix: titlePrefix,
      title_suffix: titleSuffix,
      default_description: description,
      default_keywords: textToKeywords(keywords) ?? [],
      default_author: author,
      default_og_image: ogImage,
      og_locale: ogLocale,
      twitter_site: twitterSite,
      twitter_creator: twitterCreator,
      robots_disallow: linesToList(disallow),
      robots_extra: robotsExtra,
      allow_ai_crawlers: allowAi,
      llms_enabled: llms,
      entity_type: entityType,
      same_as: linesToList(sameAs),
      contact_email: contactEmail.trim() === "" ? null : contactEmail.trim(),
      tagline: tagline.trim() === "" ? null : tagline.trim(),
    };

    startTransition(async () => {
      const result = await saveSeoSettingsAction(input);
      setConfirming(false);
      if (!result.ok) {
        setErrors(result.errors ?? {});
        toast.error(result.message);
        return;
      }
      setErrors({});
      onSaved(result.overview);
      setOgImage(result.overview.settings.default_og_image);
      toast.success(result.message);
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (siteUrlChanged) {
      setConfirming(true);
      return;
    }
    save();
  }

  const error = (name: string) =>
    errors[name]?.[0] ? <p className="text-xs text-destructive">{errors[name][0]}</p> : null;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Used by every page that doesn&apos;t set its own value. The site name comes from General.
      </p>

      {settings.environment_warning ? (
        <p
          role="alert"
          className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-6 text-amber-800 dark:text-amber-200"
        >
          {settings.environment_warning}
        </p>
      ) : null}

      <SeoFieldGroup title="Website" description="The address search engines and social cards should use.">
        <div className="space-y-2">
          <Label htmlFor="seo-site-url">Public site URL</Label>
          <Input
            id="seo-site-url"
            value={siteUrl}
            onChange={(event) => setSiteUrl(event.target.value)}
            placeholder={settings.site_url_fallback}
            inputMode="url"
            maxLength={255}
            disabled={pending}
          />
          <p className="text-xs leading-5 text-muted-foreground">
            The origin used in canonical links, the sitemap and social cards. Empty uses {settings.site_url_fallback}.
          </p>
          {settings.site_url_warning ? (
            <p role="alert" className="text-xs leading-5 text-amber-600 dark:text-amber-400">
              {settings.site_url_warning}
            </p>
          ) : null}
          {error("site_url")}
        </div>
      </SeoFieldGroup>

      <SeoFieldGroup
        title="Site owner (structured data)"
        description="Who the site belongs to, as search engines read it. Only fields you fill in are published."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="seo-entity-type">Owner type</Label>
            <Select
              value={entityType}
              onValueChange={(value) => setEntityType(value as "Organization" | "Person")}
              disabled={pending}
            >
              <SelectTrigger id="seo-entity-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Organization">Organization (company, club, brand)</SelectItem>
                <SelectItem value="Person">Person</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs leading-5 text-muted-foreground">
              Tells search engines whether the site belongs to a business or to one person. Choose Organization for a company,
              club or brand.
            </p>
            {error("entity_type")}
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-contact-email">Public contact email</Label>
            <Input
              id="seo-contact-email"
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              maxLength={255}
              disabled={pending}
            />
            {error("contact_email")}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo-tagline">Short description of the owner</Label>
          <Input
            id="seo-tagline"
            value={tagline}
            onChange={(event) => setTagline(event.target.value)}
            maxLength={160}
            disabled={pending}
          />
          <p className="text-xs leading-5 text-muted-foreground">Also printed on the generated social card.</p>
          {error("tagline")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo-same-as">Official profile links</Label>
          <Textarea
            id="seo-same-as"
            value={sameAs}
            onChange={(event) => setSameAs(event.target.value)}
            rows={3}
            placeholder="https://www.linkedin.com/company/your-company"
            disabled={pending}
          />
          <p className="text-xs leading-5 text-muted-foreground">One real https address per line. Empty publishes none.</p>
          {error("same_as")}
        </div>
      </SeoFieldGroup>

      <SeoFieldGroup title="Page titles"description="Added before or after every page title, unless a page turns it off.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="seo-title-prefix">Title prefix</Label>
            <Input
              id="seo-title-prefix"
              value={titlePrefix}
              onChange={(event) => setTitlePrefix(event.target.value)}
              maxLength={120}
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-title-suffix">Title suffix</Label>
            <Input
              id="seo-title-suffix"
              value={titleSuffix}
              onChange={(event) => setTitleSuffix(event.target.value)}
              maxLength={120}
              disabled={pending}
            />
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          Example: <span className="font-medium text-foreground">{sample}</span>. Placeholders:{" "}
          {overview.options.placeholders.join(" ")}
        </p>
      </SeoFieldGroup>

      <SeoFieldGroup title="Search results" description="The snippet shown under a page title in Google and other engines.">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="seo-default-description">Default description</Label>
            <CharCount value={description} range={overview.options.lengths.description} />
          </div>
          <Textarea
            id="seo-default-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            maxLength={500}
            disabled={pending}
          />
          {error("default_description")}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="seo-default-keywords">Default keywords</Label>
            <Input
              id="seo-default-keywords"
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              placeholder="Comma separated"
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-default-author">Default author</Label>
            <Input
              id="seo-default-author"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              maxLength={120}
              disabled={pending}
            />
          </div>
        </div>
      </SeoFieldGroup>

      <SeoFieldGroup title="Social sharing" description="The card shown when a link is shared on Facebook, LinkedIn, X and chat apps.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <MediaChoiceField
              label="Default social image"
              url={ogImage}
              accept={["image"]}
              disabled={pending}
              onChange={setOgImage}
            />
            <p className="text-xs leading-5 text-muted-foreground">1200 × 630. Empty uses a generated card with the site name.</p>
            {error("default_og_image")}
          </div>
          <div className="grid content-start gap-4">
            <div className="space-y-2">
              <Label htmlFor="seo-og-locale">Locale</Label>
              <Input
                id="seo-og-locale"
                value={ogLocale}
                onChange={(event) => setOgLocale(event.target.value)}
                placeholder="en_US"
                maxLength={6}
                disabled={pending}
              />
              {error("og_locale")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="seo-twitter-site">X account</Label>
                <Input
                  id="seo-twitter-site"
                  value={twitterSite}
                  onChange={(event) => setTwitterSite(event.target.value)}
                  placeholder="@site"
                  maxLength={16}
                  disabled={pending}
                />
                {error("twitter_site")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-twitter-creator">X creator</Label>
                <Input
                  id="seo-twitter-creator"
                  value={twitterCreator}
                  onChange={(event) => setTwitterCreator(event.target.value)}
                  placeholder="@author"
                  maxLength={16}
                  disabled={pending}
                />
                {error("twitter_creator")}
              </div>
            </div>
          </div>
        </div>
      </SeoFieldGroup>

      <SeoFieldGroup title="Crawlers and AI" description="What robots.txt allows, and whether AI assistants get a summary.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start justify-between gap-4 rounded-xl border border-border/70 p-4">
            <div>
              <p className="text-sm font-medium">Allow AI crawlers</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Off blocks GPTBot, ClaudeBot, CCBot and other AI training crawlers in robots.txt.
              </p>
            </div>
            <Switch checked={allowAi} onCheckedChange={setAllowAi} disabled={pending} aria-label="Allow AI crawlers" />
          </div>
          <div className="flex items-start justify-between gap-4 rounded-xl border border-border/70 p-4">
            <div>
              <p className="text-sm font-medium">Publish llms.txt</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">A short Markdown summary of the site for AI assistants.</p>
            </div>
            <Switch checked={llms} onCheckedChange={setLlms} disabled={pending} aria-label="Publish llms.txt" />
          </div>
        </div>

        <SeoDisclosure
          title="Custom robots.txt rules"
          description="/admin and /api/ are always blocked. Add more only if you need to."
          defaultOpen={disallow.trim() !== "" || robotsExtra.trim() !== ""}
          forceOpen={Boolean(errors.robots_disallow?.[0] || errors.robots_extra?.[0])}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="seo-robots-disallow">Extra disallowed paths</Label>
              <Textarea
                id="seo-robots-disallow"
                value={disallow}
                onChange={(event) => setDisallow(event.target.value)}
                rows={4}
                placeholder={"/drafts\n/preview"}
                disabled={pending}
              />
              <p className="text-xs leading-5 text-muted-foreground">One per line.</p>
              {error("robots_disallow")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-robots-extra">Extra robots.txt lines</Label>
              <Textarea
                id="seo-robots-extra"
                value={robotsExtra}
                onChange={(event) => setRobotsExtra(event.target.value)}
                rows={4}
                maxLength={2000}
                className="font-mono text-xs"
                disabled={pending}
              />
              {error("robots_extra")}
            </div>
          </div>
        </SeoDisclosure>
      </SeoFieldGroup>

      <div className="sticky bottom-0 z-10 -mx-1 flex items-center justify-end gap-3 rounded-xl border border-border/70 bg-background/95 px-4 py-3 backdrop-blur">
        <p className="mr-auto text-xs text-muted-foreground">Changes apply to every page that uses the defaults.</p>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save site defaults"}
        </Button>
      </div>

      <Dialog open={confirming} onOpenChange={(open) => (!pending ? setConfirming(open) : undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change the public site URL?</DialogTitle>
            <DialogDescription>
              Canonical links, the sitemap and social cards will point at {siteUrl.trim() || settings.site_url_fallback}{" "}
              instead of {settings.site_url}. Search engines treat this as a move, so only change it when the domain changes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirming(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={pending}>
              {pending ? "Saving…" : "Change URL"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
