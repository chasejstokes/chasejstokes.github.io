import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as helper from "./helpers.js"

d3.csv("../js/public/data/book_data.csv").then(data => {
    const data_complete = data.filter((d) => d.end_date != "")
    // console.log("Data loaded:", data_complete);

    vizData(data_complete)
}).catch(error => {
    console.error("Error loading data:", error);
});


async function vizData(data, numRecent = 10) {

    // 
    // Recent Books
    // 
    const recent_books = data.reverse().slice(0, Math.min(data.length, numRecent));

    // get recent books banner
    const recentBooksDiv = d3.select("#recent-books");
    // load + render once
    const urls = await helper.getRecentCoverUrls(recent_books);

    renderRecentBooks(recentBooksDiv, urls);
    // simple responsive: re-render on resize
    window.addEventListener("resize", () => renderRecentBooks(recentBooksDiv, urls));

    // get recent books banner
    const recentBooksGenreDiv = d3.select("#recent-books-genre");
    // load + render once
    renderRecentBookGenres(recentBooksGenreDiv, recent_books, data);
    // simple responsive: re-render on resize
    window.addEventListener("resize", () => renderRecentBookGenres(recentBooksGenreDiv, recent_books));


}

function renderRecentBooks(container, urls) {

    const { node, W, H } = helper.getContainerDims(container, 0.25, 180)

    container.style("height", `${H}px`);

    const N = urls.length;
    const x = helper.scaleBandX(N, W)

    const imgMaxH = 120;
    const top = Math.max(Math.round((H - imgMaxH) / 2), 10);

    const books = container.selectAll("img.book-cover")
        .data(urls, d => d);

    books.join(
        enter => enter.append("img")
            .attr("class", "book-cover")
            .attr("src", d => d)
            // layout (initial)
            .style("left", (d, i) => `${x(i) + x.bandwidth() / 2}px`)
            .style("max-height", `${imgMaxH}px`)
            .style("max-width", `${Math.floor(x.bandwidth())}px`)
            // animate only on enter
            .style("opacity", 0)
            .style("top", `${top - 20}px`)
            .transition()
            .delay((d, i) => 500 + i * 150)
            .duration(700)
            .style("opacity", 1)
            .style("top", `${top}px`),

        update => update
            .interrupt() // prevent replay on resize
            // layout only, no animation
            .style("left", (d, i) => `${x(i) + x.bandwidth() / 2}px`)
            .style("max-height", `${imgMaxH}px`)
            .style("max-width", `${Math.floor(x.bandwidth())}px`)
            .style("top", `${top}px`)
    );

}

function renderRecentBookGenres(container, recent_books, data) {


    const { node, W, H } = helper.getContainerDims(container, 0.1, 100)

    container.style("height", `${H}px`);

    const N = recent_books.length;
    const x = helper.scaleBandX(N, W)

    const pillMaxH = 60;
    const top = Math.max(Math.round((H - pillMaxH) / 2), 10);


    const slots = container.selectAll(".genre-slot")
        .data(recent_books, d => d.title);

    // const unique_genres = data.map((d) => d.genre).filter((value, index, array) => array.indexOf(value) === index)
    const colorScale = helper.createGenreScale();

    slots.join(
        enter => {
            const s = enter.append("div")
                .attr("class", "genre-slot")
                .style("position", "absolute")
                .style("left", (d, i) => `${x(i) + x.bandwidth() / 2}px`)
                .style("top", `${top - 10}px`)              // start slightly up
                .style("width", `${x.bandwidth()}px`)
                .style("height", `${pillMaxH}px`)
                .style("transform", "translateX(-50%)")
                .style("display", "flex")
                .style("align-items", "center")
                .style("justify-content", "center")
                .style("opacity", 0);

            // the colored rectangle
            s.append("div")
                .attr("class", "genre-pill")
                .style("background", d => colorScale(d.genre))
                .style("color", "#fff")
                .style("padding", "6px 10px")
                .style("border-radius", "10px")
                // .style("box-shadow", "0 8px 18px rgba(0,0,0,0.18)")
                .style("font-weight", "400")
                .style("max-width", "100%")
                .style("white-space", "nowrap")
                .style("overflow", "hidden")
                .style("text-overflow", "ellipsis")
                .text(d => d.genre);

            // enter-only animation
            s.transition()
                .delay((d, i) => 450 + i * 140)
                .duration(650)
                .style("opacity", 1)
                .style("top", `${top}px`);
        },

        update => update
            .interrupt() // no replay on resize
            .style("left", (d, i) => `${x(i) + x.bandwidth() / 2}px`)
            .style("top", `${top}px`)
            .style("width", `${x.bandwidth()}px`)
            .style("height", `${pillMaxH}px`)
            .select(".genre-pill")
            .style("background", d => colorScale(d.genre))
    )

}