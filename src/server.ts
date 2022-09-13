import express from "express";

const app = express();

app.get("/ads", (req, res) => {
  res.json([
    {
      id: 1,
      title: "Ad 12",
    },
  ]);
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
