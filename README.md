<h1>osu-log</h1>

A full-stack web application for syncing, storing, and analyzing osu! play sessions. The app pulls recent scores from the osu! API, persists them to a PostgreSQL database, and provides interactive tools for filtering and visualizing performance data.

<h2>Motivation</h2>
I built this project to demonstrate practical full-stack application development, with a focus on third-party API integration, data persistence, and meaningful data visualization. The goal was to design something complete and usable, rather than a demo or tutorial project, while solving real concerns like API rate limits and efficient querying.

I first had the idea for this project a few years ago, and after a lot of learning, trial and error, and a rewrite or two, I’m happy to finally share it with the osu! community and hope they find it useful.

<h2>Core Features</h2>
<ul>
  <li>Manual syncing of recent osu! scores via the official osu! API</li>
  <li>Persistent logging of play sessions to a PostgreSQL database</li>
  <li>Date-based session selection and filtering</li>
  <li>Detailed table view of individual scores and metadata</li>
  <li>
    Interactive charting:
    <ul>
      <li>Histogram mode for value distributions</li>
      <li>Line graph mode for tracking values over time</li>
      <li>Toggle between per-score and per-session data points</li>
    </ul>
  </li>
</ul>

<h2>Tech Stack</h2>
<ul>
  <li>
    Frontend
    <ul>
      <li>JavaScript with Svelte Framework</li>
      <li>Chart.js</li>
    </ul>
  </li>
  <li>
    Backend
    <ul>
      <li>Node.js with Express</li>
    </ul>
  </li>
  <li>
    Database
    <ul>
      <li>PostgreSQL</li>
    </ul>
  </li>
</ul>

<h2>Architecture</h2>

Frontend communicates with an Express API

Backend handles osu! API requests, rate-safety logic, and persistence

PostgreSQL runs server-side only and is not publicly exposed

<h3>Data Model (High Level)</h3>

Play sessions are grouped by time: any new score fetched from the osu! API that is one hour or more after the last saved score for a user is assigned a new session ID. This allows analysis and visualization at the session level while preserving chronological order and trends. Charts currently display data per score; a toggle will be added to allow aggregation per session.

<h2>Current Status</h2>

The project is functionally complete and suitable for production-style use. Data fetching is currently manual by design, with a focus on correctness, API safety, and UX clarity.

Active development is ongoing.

<h2>Potential Improvements</h2>

<ul>
  <li>User authentication and account-based tracking</li>
  <li>Automatic session-based chart toggling</li>
  <li>Automated background syncing of play data</li>
  <li>Expanded statistical analysis</li>
  <li>Additional chart types and comparisons</li>
  <li>UI and performance refinements</li>
</ul>


