#!/usr/bin/env python3
import json
import sys


def main() -> int:
    if len(sys.argv) < 2:
        print("Missing scholar user id", file=sys.stderr)
        return 2

    scholar_user_id = sys.argv[1]

    try:
        from scholarly import scholarly  # type: ignore
    except Exception as exc:
        print(f"Failed to import scholarly: {exc}", file=sys.stderr)
        return 3

    try:
        author = scholarly.search_author_id(scholar_user_id)
        author_filled = scholarly.fill(author, sections=["publications"])
    except Exception as exc:
        print(f"Failed to fetch scholar profile: {exc}", file=sys.stderr)
        return 4

    citations_by_scholar_id: dict[str, int] = {}
    total_citations = 0

    for publication in author_filled.get("publications", []):
        author_pub_id = publication.get("author_pub_id", "")
        scholar_id = ""
        if isinstance(author_pub_id, str) and ":" in author_pub_id:
            scholar_id = author_pub_id.split(":", 1)[1]

        citation_count = publication.get("num_citations", 0)
        if not isinstance(citation_count, int):
            try:
                citation_count = int(citation_count)
            except Exception:
                citation_count = 0

        total_citations += citation_count
        if scholar_id:
            citations_by_scholar_id[scholar_id] = citation_count

    payload = {
        "totalCitations": total_citations,
        "citationsByScholarId": citations_by_scholar_id,
    }
    print(json.dumps(payload, ensure_ascii=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
