import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// 
// 
// 
// recentBooks
// 
// 
// 

// Function to get the book cover URL from the Open Library API
// A function to get the book cover URL from the Open Library API
export async function getBookCoverUrl(title, author) {
    // Construct the search URL using both the title and author 
    const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`;
    try {
        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.docs.length > 0) {

            const book = data.docs[0];
            const coverId = book.cover_i;

            if (coverId) {
                return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
            }
        }
    }
    catch (error) {
        console.error(`Error fetching cover for ${title} by ${author}:, error`);
    }

    return null;
}

export async function getRecentCoverUrls(recent_books) {
    const urlsRaw = await Promise.all(recent_books.map(b => getBookCoverUrl(b.title, b.author)));
    const urls = urlsRaw.filter(Boolean)
    return urls;
}

// 
// common data/viz functions
// 

export function scaleBandX(N, W) {
    return d3.scaleBand()
        .domain(d3.range(N))
        .range([0, W])
        .padding(0.12);
}

export function getContainerDims(container, multiplier, maxHeight) {
    const node = container.node();
    const W = node.clientWidth || 600;   // current width (80% of parent)
    const H = Math.max(40, Math.min(Math.round(W * multiplier), maxHeight));

    return { node, W, H }
}

const GENRE_COLORS = {
    "Fantasy": "#6c64ee",
    "Sci-Fi": "#5a9ff4",
    "Romance": "#db7a89",
    "Mystery/Thriller": "#d55909",
    "Fiction": "#a63dcd",
    "Non-Fiction": "#2f833f",
    "Horror": "#b31616",
    "Dystopian": "#811f64",
};

const FALLBACK_COLOR = "#9CA3AF"; // gray for unmapped/unknown

export function createGenreScale() {
    return (genre) => GENRE_COLORS[genre] ?? FALLBACK_COLOR;
}
