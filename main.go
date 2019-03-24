package main

import (
	"bytes"
	"encoding/base64"
	"html/template"
	"image"
	"image/draw"
	"image/gif"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	// brotli_enc "gopkg.in/kothar/brotli-go.v0/enc"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("$PORT must be set")
	}

	r := chi.NewRouter()
	r.Use(middleware.RequestID, middleware.RealIP, middleware.Logger, middleware.Recoverer)
	r.Use(middleware.GetHead, middleware.Timeout(15*time.Second))
	// compressor := middleware.NewCompressor(7)
	// compressor.SetEncoder("br", func(w io.Writer, level int) io.Writer {
	// 	params := brotli_enc.NewBrotliParams()
	// 	params.SetQuality(level)
	// 	return brotli_enc.NewBrotliWriter(params, w)
	// })
	// r.Use(compressor.Handler())
	cors := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "HEAD", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
	})
	r.Use(cors.Handler)
	r.Use(hsts)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		tmpl := template.Must(template.ParseFiles("./public/dist/index.html"))
		if err := tmpl.ExecuteTemplate(w, "index.html", nil); err != nil {
			log.Printf("cannot compile template: %s\n", err)
			w.WriteHeader(http.StatusInternalServerError)
		} else {
			w.WriteHeader(http.StatusOK)
		}
	})

	r.Get("/page/split", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		tmpl := template.Must(template.ParseFiles("./public/dist/split.html"))
		if err := tmpl.ExecuteTemplate(w, "split.html", nil); err != nil {
			log.Printf("cannot compile template: %s\n", err)
			w.WriteHeader(http.StatusInternalServerError)
		} else {
			w.WriteHeader(http.StatusOK)
		}
	})
	r.Get("/page/split/*", func(w http.ResponseWriter, r *http.Request) {
		imageURL := strings.Replace(r.URL.String(), "/page/split/", "", 1)
		http.Redirect(w, r, "/page/split#"+imageURL, http.StatusFound)
	})

	r.Get("/page/reverse", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		tmpl := template.Must(template.ParseFiles("./public/dist/reverse.html"))
		if err := tmpl.ExecuteTemplate(w, "reverse.html", nil); err != nil {
			log.Printf("cannot compile template: %s\n", err)
			w.WriteHeader(http.StatusInternalServerError)
		} else {
			w.WriteHeader(http.StatusOK)
		}
	})
	r.Get("/page/reverse/*", func(w http.ResponseWriter, r *http.Request) {
		imageURL := strings.Replace(r.URL.String(), "/page/reverse/", "", 1)
		http.Redirect(w, r, "/page/reverse#"+imageURL, http.StatusFound)
	})

	r.Get("/page/frame/*", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		imageURL := strings.Replace(r.URL.String(), "/page/frame/", "", 1)
		cli := GetHTTPClient()
		res, err := cli.Request("GET", imageURL, nil, nil)
		if err != nil {
			log.Printf("cannot request: %s\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer res.Body.Close()
		target, err := gif.DecodeAll(res.Body)
		if err != nil {
			log.Printf("cannot load gif: %s\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		images := make([]string, 0, len(target.Image))
		for _, frame := range target.Image {
			image := &gif.GIF{
				Image:           []*image.Paletted{frame},
				BackgroundIndex: target.BackgroundIndex,
				Config:          target.Config,
				Delay:           []int{0},
				Disposal:        []byte{0},
			}
			buf := new(bytes.Buffer)
			err := gif.EncodeAll(buf, image)
			if err != nil {
				log.Printf("cannot encode gif: %s\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			images = append(images, base64.StdEncoding.EncodeToString(buf.Bytes()))
		}
		tmpl := template.Must(template.ParseFiles("./public/dist/frame.html"))
		if err := tmpl.ExecuteTemplate(w, "frame.html", images); err != nil {
			log.Printf("cannot compile template: %s\n", err)
			w.WriteHeader(http.StatusInternalServerError)
		} else {
			w.WriteHeader(http.StatusOK)
		}
	})
	r.Get("/gif/playback/*", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "image/gif")
		imageURL := strings.Replace(r.URL.String(), "/gif/playback/", "", 1)
		cli := GetHTTPClient()
		res, err := cli.Request("GET", imageURL, nil, nil)
		if err != nil {
			log.Printf("cannot request: %s\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer res.Body.Close()
		target, err := gif.DecodeAll(res.Body)
		if err != nil {
			log.Printf("cannot load gif: %s\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		frameCount := len(target.Image)
		images := &gif.GIF{
			BackgroundIndex: target.BackgroundIndex,
			Config:          target.Config,
			LoopCount:       0,
			Image:           make([]*image.Paletted, frameCount, frameCount),
			Delay:           make([]int, frameCount, frameCount),
			Disposal:        make([]byte, frameCount, frameCount),
		}
		frames := make([]*image.Paletted, frameCount, frameCount)
		rect := image.Rect(0, 0, images.Config.Width, images.Config.Height)
		for frameIndex, frame := range target.Image {
			if frameIndex == 0 {
				frames[0] = frame
				continue
			}
			out := image.NewPaletted(rect, frame.Palette)
			draw.Draw(out, rect, frames[frameIndex-1], image.ZP, draw.Over)
			draw.Draw(out, rect, frame, image.ZP, draw.Over)
			frames[frameIndex] = out
		}
		for frameIndex := range target.Image {
			images.Image[frameCount-1-frameIndex] = frames[frameIndex]
			images.Delay[frameCount-1-frameIndex] = target.Delay[frameIndex]
			images.Disposal[frameCount-1-frameIndex] = target.Disposal[frameIndex]
		}
		buf := new(bytes.Buffer)
		if err := gif.EncodeAll(buf, images); err != nil {
			log.Printf("cannot encode gif: %s\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write(buf.Bytes())
	})

	fileServer(r, "/", http.Dir("./public"))

	http.ListenAndServe(":"+port, r)
}

func fileServer(r chi.Router, path string, root http.FileSystem) {
	if strings.ContainsAny(path, "{}*") {
		log.Fatal("FileServer does not permit URL parameters.")
	}

	fs := http.StripPrefix(path, http.FileServer(root))

	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", 301).ServeHTTP)
		path += "/"
	}
	path += "*"

	r.Get(path, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fs.ServeHTTP(w, r)
	}))
}

func hsts(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		originalProtcol := r.Header.Get("X-Forwarded-Proto")
		if originalProtcol == "https" {
			w.Header().Set("Strict-Transport-Security", "max-age=63072000; preload")
		}
		next.ServeHTTP(w, r)
	}
	return http.HandlerFunc(fn)
}
