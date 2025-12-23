const express = require("express");
const ytsr = require("ytsr");
const play = require('play-dl');

const app = express();
const PORT = 3000;

// 🔍 SEARCH ENDPOINT
app.get('/search', async (req, res) => {
  const query = req.query.q;

  if (!query) return res.status(400).send('Missing search query');

  try {
    const result = await ytsr(query, { limit: 10 });
    const play_result = await play.search(query,{limit:2});
    const videos = result.items
      .filter(item => item.type === 'video')
      .map(video => ({
        title: video.title,
        id: video.id,
        url: video.url,
        thumbnail: video.bestThumbnail?.url,
        duration: video.duration
      }));
    console.log(play_result);
    res.send(`<audio controls>
  <source src="https://www.youtube.com/watch?v=D66eu676PJo" type="audio/webm">
</audio>
`);

  } catch (err) {
    console.error(err);
    res.status(500).send('Search failed');
  }
});

// 🎵 AUDIO STREAM (from earlier)
app.get('/audio', async (req, res) => {
  const url = req.query.url;
  console.log(url,"This is the url You are looking");
  if (!url) {
    return res.status(400).send('Invalid YouTube URL');
  }
  try {
       let yt_info = await play.video_info("https://www.youtube.com/watch?v=1XOJFuKHCck");
        console.log(yt_info.video_details.title) 
        let stream = await play.stream_from_info(yt_info)
    // const stream = await play.stream("https://www.youtube.com/watch?v=1XOJFuKHCck");
    res.setHeader('Content-Type', 'audio/webm');
     stream.stream.pipe(res);

    console.log(res);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error streaming audio');
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));