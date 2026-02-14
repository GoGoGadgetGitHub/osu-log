<h1>osu-log</h1>

A full-stack web application for syncing, storing, and analyzing osu! play sessions. The app pulls recent scores from the osu! API, saves them to a PostgreSQL database, and provides interactive tools for filtering and visualizing performance data.

<h2>Motivation</h2>
I built this project to demonstrate practical full-stack application development, with a focus on third-party API integration, data persistence, and meaningful data visualization. The goal was to design something complete and usable.

I, more than anyone, knows it's not always how much you play that matters but how you play and what you play. This web app aims to help you see the bigger picture of your gameplay. Not just your top 100 or locals. It will save EVERYTHING even your fails and trys to give you ways to analyse this data. 

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

<h2>How it works</h2>

When you enter your osu username, the site will fetch your most recent scores from the osu server and save those to a database for you. (Note that this will only fetch scores from the last 48 hours). Your scores are grouped as sessions which are defined as scores less than an hour apart.

You'll see a calendar with orange highlighted days. 

<img width="471" height="371" alt="2026-02-14_14-02-1771071129" src="https://github.com/user-attachments/assets/81937fe9-158b-4592-846f-01c987d3c27a" />

These are the days on which you have sessions logged. Once you click on a day, sessions for that day will all be added to the current pool of scores your viewing, all of which you can see in the table.

<img width="985" height="879" alt="2026-02-14_14-02-1771071293" src="https://github.com/user-attachments/assets/969480de-05fc-4d1d-ba38-d9e7ac7b0881" />

Sessions can be toggled on and off using the session toggle component on the right of the calendar.

<img width="509" height="377" alt="2026-02-14_14-02-1771071270" src="https://github.com/user-attachments/assets/2d20067f-dc39-460a-a0fa-e77c7ccf63f2" />

The scores in the table are all added as data points to the graphs below.

<img width="987" height="734" alt="2026-02-14_14-02-1771071354" src="https://github.com/user-attachments/assets/19040c1d-1daf-4066-aaa8-75cd1d0d3e53" />

The Time tab on the graphs maps out your scores in chronological order on the x axis. The y axis is either PP, Stars, BPM, Speed, Aim, Accuracy or Pass percentage. Each of these have three different modes. Line, Trend and None. Line and None are self explanatory. Trend takes the average of 21 scores and plots it as a point (i.e. the current score, 10 ahead and 10 behind).

The Spread tab trys to show you the distribution of different stats, specifically, Star Rating, OD, AR and BPM by grouping them in ranges starting at the lowest value going up to the highest

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


