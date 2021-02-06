# amate-tiktok
Automate TikTok

A tool to download tiktok videos and compile them into one with blured background.

# Add background

```bash
ffmpeg -loglevel error -r 30 -i resources/bkg.png -i videos/output.mp4 -b:v 1M -filter_complex "[1:v]scale="750" : "1080" [ovrl], [0:v][ovrl]overlay=(main_w-overlay_w)/2:((main_h-overlay_h)/2)"  videos/output_o.mp4
```
