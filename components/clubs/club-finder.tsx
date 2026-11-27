"use client";

import { Building2, Search } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DirectoryClub, DirectoryContinent, DirectoryCountry, DirectoryLeague } from "@/lib/clubs/types";

async function load<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });

    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

/**
 * How a club finds itself: pick Continent, Country, League and Club, or type
 * the name and take the closest match. Names only. A club that can still be
 * activated gets the link to do it.
 */
export function ClubFinder({ continents }: { continents: DirectoryContinent[] }) {
  const [continent, setContinent] = useState("");
  const [country, setCountry] = useState("");
  const [league, setLeague] = useState("");
  const [countries, setCountries] = useState<DirectoryCountry[]>([]);
  const [leagues, setLeagues] = useState<DirectoryLeague[]>([]);
  const [clubs, setClubs] = useState<DirectoryClub[]>([]);
  const [chosen, setChosen] = useState<DirectoryClub | null>(null);
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState<DirectoryClub[]>([]);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Only the newest answer may update the screen, whatever order they arrive in.
  const latest = useRef(0);

  async function pickContinent(value: string) {
    setContinent(value);
    setCountry("");
    setLeague("");
    setCountries([]);
    setLeagues([]);
    setClubs([]);
    setChosen(null);

    const token = ++latest.current;
    const data = await load<{ countries: DirectoryCountry[] }>(`/api/clubs/directory/countries?continent=${encodeURIComponent(value)}`);

    if (token !== latest.current) return;
    setFailed(data === null);
    setCountries(data?.countries ?? []);
  }

  async function pickCountry(value: string) {
    setCountry(value);
    setLeague("");
    setLeagues([]);
    setClubs([]);
    setChosen(null);

    const token = ++latest.current;
    const data = await load<{ leagues: DirectoryLeague[] }>(`/api/clubs/directory/leagues?country=${encodeURIComponent(value)}`);

    if (token !== latest.current) return;
    setFailed(data === null);
    setLeagues(data?.leagues ?? []);
  }

  async function pickLeague(value: string) {
    setLeague(value);
    setClubs([]);
    setChosen(null);

    const token = ++latest.current;
    const data = await load<{ clubs: DirectoryClub[] }>(
      `/api/clubs/directory/clubs?country=${encodeURIComponent(country)}&league=${encodeURIComponent(value)}`,
    );

    if (token !== latest.current) return;
    setFailed(data === null);
    setClubs(data?.clubs ?? []);
  }

  function type(value: string) {
    setText(value);
    setChosen(null);

    if (timer.current) clearTimeout(timer.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    timer.current = setTimeout(async () => {
      const token = ++latest.current;
      const data = await load<{ clubs: DirectoryClub[] }>(`/api/clubs/search?q=${encodeURIComponent(value.trim())}`);

      if (token !== latest.current) return;
      setFailed(data === null);
      setSuggestions(data?.clubs ?? []);
    }, 250);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Find your club</CardTitle>
        <CardDescription>
          Choose your club from the list, or start typing its name. Then activate it with a code we send to the club&apos;s official email address.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs defaultValue="browse" onValueChange={() => setChosen(null)}>
          <TabsList className="w-full">
            <TabsTrigger value="browse">Browse the list</TabsTrigger>
            <TabsTrigger value="search">Search by name</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-3 pt-2">
            <Field label="Continent">
              <Select value={continent} onValueChange={pickContinent}>
                <SelectTrigger className="w-full" aria-label="Continent">
                  <SelectValue placeholder="Choose a continent" />
                </SelectTrigger>
                <SelectContent>
                  {continents.map((item) => (
                    <SelectItem key={item.slug} value={item.slug}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Country">
              <Select value={country} onValueChange={pickCountry} disabled={countries.length === 0}>
                <SelectTrigger className="w-full" aria-label="Country">
                  <SelectValue placeholder="Choose a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((item) => (
                    <SelectItem key={item.slug} value={item.slug}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="League">
              <Select value={league} onValueChange={pickLeague} disabled={leagues.length === 0}>
                <SelectTrigger className="w-full" aria-label="League">
                  <SelectValue placeholder="Choose a league" />
                </SelectTrigger>
                <SelectContent>
                  {leagues.map((item) => (
                    <SelectItem key={item.slug} value={item.slug}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Club">
              <Select value={chosen?.code ?? ""} onValueChange={(code) => setChosen(clubs.find((club) => club.code === code) ?? null)} disabled={clubs.length === 0}>
                <SelectTrigger className="w-full" aria-label="Club">
                  <SelectValue placeholder="Choose your club" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((item) => (
                    <SelectItem key={item.code} value={item.code}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </TabsContent>

          <TabsContent value="search" className="space-y-3 pt-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                value={text}
                onChange={(event) => type(event.target.value)}
                placeholder="Start typing your club name"
                className="pl-9"
                aria-label="Club name"
                autoComplete="off"
              />
            </div>

            {suggestions.length > 0 ? (
              <ul className="divide-y rounded-xl border border-border/70 bg-background/60" aria-label="Matching clubs">
                {suggestions.map((club) => (
                  <li key={club.code}>
                    <button
                      type="button"
                      onClick={() => setChosen(club)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{club.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {club.league} · {club.country}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : text.trim().length >= 2 ? (
              <p className="text-sm text-muted-foreground">No club matches yet. Check the spelling, or browse the list.</p>
            ) : null}
          </TabsContent>
        </Tabs>

        {failed ? <p className="text-sm text-destructive">We could not load the clubs. Please try again in a moment.</p> : null}

        {chosen ? <Chosen club={chosen} /> : null}

        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}

function Chosen({ club }: { club: DirectoryClub }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/40 p-4" role="status">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
          <Building2 className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{club.name}</p>
          <p className="text-sm text-muted-foreground">
            {club.league} · {club.country}
          </p>

          {club.state === "available" ? (
            <Button asChild className="mt-3">
              <Link href={`/activate/${club.code}`}>Activate this club</Link>
            </Button>
          ) : club.state === "active" ? (
            <p className="mt-3 text-sm">
              <Badge variant="secondary" className="mr-2">Already active</Badge>
              This club has already been activated. Ask your club admin to invite you.
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">This club cannot be activated right now. Please contact the Clearing+ team.</p>
          )}
        </div>
      </div>
    </div>
  );
}
