---
tags: [meta, howto]
---

# Refreshing `playlist.md` via Exportify

Use this when you add songs to your Spotify playlist (or want to switch to a different one). Takes ~2 minutes. We do **not** use the Spotify Web API directly — Exportify is faster, free, and read-only.

## Steps

1. Open **https://exportify.net** in any browser.
2. Click **Log in with Spotify**. Authenticate with your normal Spotify account. Grant the permissions it asks for — Exportify only reads.
3. The page lists your playlists and the ones you've saved. Find the target playlist and click **Export** (or the CSV icon next to it).
4. Save the file. Default name is something like `<playlist_name>.csv`. Drop it in the **project root** at the top of this vault.
5. In a Claude Code session in that folder, say:
   > Refresh the playlist file from the CSV at the project root.
6. Claude reads the CSV, rewrites `vault/_meta/playlist.md`, deletes the CSV.

## What gets kept vs. dropped

The CSV from Exportify has 24 columns including Spotify's audio features (danceability, energy, valence, etc.). Those are dropped when rewriting `playlist.md` — they don't inform language learning. The columns kept are: title, artist, album, year, length, genres, Spotify URL. Track origin is annotated by hand based on artist provenance.

## If you want to export multiple playlists at once

Exportify has an **Export all** button at the top. The resulting ZIP contains one CSV per playlist. Drop the whole ZIP at the project root and ask Claude to refresh. Only the playlist you name in the request becomes `playlist.md`; the others become reference sources (mentioned in `playlist.md` under *Other potential sources*).

## Why not automate the trigger

A file-watcher that auto-converts dropped CSVs is overkill for a 2-minute manual job that happens maybe once a month. Cost > benefit. Stay manual.

## Other music sources (not Spotify)

If you don't use Spotify:

- **YouTube Music / Apple Music**: there's no equivalent of Exportify, but you can paste a list of "artist — title" pairs into a Claude Code session and ask Claude to format them as the `playlist.md` table.
- **Local files**: same. Drop a `.txt` or `.csv` list at the project root and ask Claude to convert it.
- **Manual**: edit `vault/_meta/playlist.md` by hand. The format is just a Markdown table — nothing magical.
