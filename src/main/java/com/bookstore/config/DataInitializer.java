package com.bookstore.config;

import com.bookstore.model.Author;
import com.bookstore.model.Book;
import com.bookstore.repository.BookRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final BookRepository bookRepository;

    public DataInitializer(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Override
    public void run(String... args) {
        if (bookRepository.count() > 0) return;

        Book book1 = new Book("978-0-7475-3269-9", "Harry Potter and the Philosopher's Stone", 1997, 19.99, "Fantasy");
        book1.addAuthor(new Author("J.K. Rowling", "1965-07-31"));

        Book book2 = new Book("978-0-452-28423-4", "1984", 1949, 14.99, "Dystopian");
        book2.addAuthor(new Author("George Orwell", "1903-06-25"));

        Book book3 = new Book("978-0-14-103614-4", "Animal Farm", 1945, 12.99, "Political Satire");
        book3.addAuthor(new Author("George Orwell", "1903-06-25"));

        Book book4 = new Book("978-0-06-112008-4", "To Kill a Mockingbird", 1960, 15.99, "Southern Gothic");
        book4.addAuthor(new Author("Harper Lee", "1926-04-28"));

        Book book5 = new Book("978-0-7432-7356-5", "The Great Gatsby", 1925, 13.99, "Tragedy");
        book5.addAuthor(new Author("F. Scott Fitzgerald", "1896-09-24"));

        Book book6 = new Book("978-0-385-50420-5", "The Da Vinci Code", 2003, 17.99, "Mystery Thriller");
        book6.addAuthor(new Author("Dan Brown", "1964-06-22"));

        Book book7 = new Book("978-1-56619-909-4", "Clean Code", 2008, 39.99, "Technology");
        book7.addAuthor(new Author("Robert C. Martin", "1952-12-05"));

        Book book8 = new Book("978-0-13-235088-4", "The Pragmatic Programmer", 1999, 44.99, "Technology");
        book8.addAuthor(new Author("David Thomas", "1956-12-04"));
        book8.addAuthor(new Author("Andrew Hunt", "1964-08-15"));

        bookRepository.save(book1);
        bookRepository.save(book2);
        bookRepository.save(book3);
        bookRepository.save(book4);
        bookRepository.save(book5);
        bookRepository.save(book6);
        bookRepository.save(book7);
        bookRepository.save(book8);

        System.out.println("--- Sample data initialized with " + bookRepository.count() + " books ---");
    }
}
