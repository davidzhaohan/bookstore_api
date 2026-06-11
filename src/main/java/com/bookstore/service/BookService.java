package com.bookstore.service;

import com.bookstore.dto.AuthorDto;
import com.bookstore.dto.BookRequest;
import com.bookstore.dto.BookResponse;
import com.bookstore.exception.BookNotFoundException;
import com.bookstore.exception.DuplicateIsbnException;
import com.bookstore.model.Author;
import com.bookstore.model.Book;
import com.bookstore.repository.BookRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Transactional
    public BookResponse addBook(BookRequest request) {
        if (bookRepository.existsById(request.getIsbn())) {
            throw new DuplicateIsbnException("Book with ISBN " + request.getIsbn() + " already exists");
        }

        Book book = new Book(request.getIsbn(), request.getTitle(), request.getYear(), request.getPrice(), request.getGenre());

        for (AuthorDto authorDto : request.getAuthors()) {
            Author author = new Author(authorDto.getName(), authorDto.getBirthday());
            book.addAuthor(author);
        }

        Book saved = bookRepository.save(book);
        return toResponse(saved);
    }

    @Transactional
    public BookResponse updateBook(String isbn, BookRequest request) {
        Book book = bookRepository.findById(isbn)
                .orElseThrow(() -> new BookNotFoundException("Book not found with ISBN: " + isbn));

        book.setTitle(request.getTitle());
        book.setYear(request.getYear());
        book.setPrice(request.getPrice());
        book.setGenre(request.getGenre());

        book.getAuthors().clear();
        for (AuthorDto authorDto : request.getAuthors()) {
            Author author = new Author(authorDto.getName(), authorDto.getBirthday());
            book.addAuthor(author);
        }

        Book saved = bookRepository.save(book);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookResponse> searchBooks(String title, String authorName) {
        List<Book> books;

        if (title != null && authorName != null) {
            books = bookRepository.findByTitleAndAuthorNameExact(title, authorName);
        } else if (title != null) {
            books = bookRepository.findByTitleExact(title);
        } else if (authorName != null) {
            books = bookRepository.findByAuthorNameExact(authorName);
        } else {
            books = bookRepository.findAll();
        }

        return books.stream().map(this::toResponse).toList();
    }

    @Transactional
    public void deleteBook(String isbn) {
        Book book = bookRepository.findById(isbn)
                .orElseThrow(() -> new BookNotFoundException("Book not found with ISBN: " + isbn));
        bookRepository.delete(book);
    }

    private BookResponse toResponse(Book book) {
        List<AuthorDto> authorDtos = book.getAuthors().stream()
                .map(a -> new AuthorDto(a.getName(), a.getBirthday()))
                .toList();

        return new BookResponse(book.getIsbn(), book.getTitle(), authorDtos,
                book.getYear(), book.getPrice(), book.getGenre());
    }
}
