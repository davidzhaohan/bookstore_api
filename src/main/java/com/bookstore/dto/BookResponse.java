package com.bookstore.dto;

import java.util.List;

public class BookResponse {

    private String isbn;
    private String title;
    private List<AuthorDto> authors;
    private Integer year;
    private Double price;
    private String genre;

    public BookResponse() {}

    public BookResponse(String isbn, String title, List<AuthorDto> authors, Integer year, Double price, String genre) {
        this.isbn = isbn;
        this.title = title;
        this.authors = authors;
        this.year = year;
        this.price = price;
        this.genre = genre;
    }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public List<AuthorDto> getAuthors() { return authors; }
    public void setAuthors(List<AuthorDto> authors) { this.authors = authors; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }
}
