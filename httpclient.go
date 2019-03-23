package main

import (
	"compress/gzip"
	"errors"
	"io"
	"net"
	"net/http"
	"net/url"
	"sync"
	"time"
)

type HTTPClient struct {
	client *http.Client
}

var (
	client *HTTPClient
	once   sync.Once
)

func GetHTTPClient() *HTTPClient {
	once.Do(func() {
		client = newHTTPClient()
	})
	return client
}

func newHTTPClient() *HTTPClient {
	return &HTTPClient{
		client: &http.Client{
			Timeout: 3 * time.Second,
			Transport: &http.Transport{
				DialContext: (&net.Dialer{
					Timeout:   30 * time.Second,
					KeepAlive: 30 * time.Second,
					DualStack: true,
				}).DialContext,
				MaxIdleConns:        30,
				MaxIdleConnsPerHost: 4,
				IdleConnTimeout:     30 * time.Second,
			},
		},
	}
}

func (c *HTTPClient) newRequest(method, uri string, body io.Reader) (*http.Request, error) {
	parsedURL, err := url.Parse(uri)
	if err != nil {
		return nil, err
	}
	if parsedURL.Scheme == "" {
		parsedURL.Scheme = "https:"
	}
	if parsedURL.Host == "" {
		return nil, errors.New("httpclient: invalid request hostname")
	}

	return http.NewRequest(method, parsedURL.String(), body)
}

func (c *HTTPClient) Request(method, uri string, header http.Header, body io.Reader) (*http.Response, error) {
	req, err := c.newRequest(method, uri, body)
	if err != nil {
		return nil, err
	}
	if header != nil {
		c.appendHeader(header, req)
	}
	return c.doRequest(req)
}

func (c *HTTPClient) appendHeader(header http.Header, req *http.Request) {
	for k, values := range header {
		for _, v := range values {
			req.Header.Add(k, v)
		}
	}
}

func (c *HTTPClient) doRequest(req *http.Request) (*http.Response, error) {
	res, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}

	if res.Header.Get("Content-Encoding") == "gzip" {
		gres, err := gzip.NewReader(res.Body)
		if err != nil {
			return nil, err
		}
		res.Body = gres
	}

	return res, nil
}
