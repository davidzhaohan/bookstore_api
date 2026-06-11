package com.bookstore.repository;

import com.bookstore.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, String> {

    @Query("SELECT DISTINCT b FROM Book b LEFT JOIN FETCH b.authors WHERE b.title = :title")
    List<Book> findByTitleExact(@Param("title") String title);

    @Query("SELECT DISTINCT b FROM Book b LEFT JOIN FETCH b.authors a WHERE a.name = :authorName")
    List<Book> findByAuthorNameExact(@Param("authorName") String authorName);

    @Query("SELECT DISTINCT b FROM Book b LEFT JOIN FETCH b.authors a WHERE b.title = :title AND a.name = :authorName")
    List<Book> findByTitleAndAuthorNameExact(@Param("title") String title, @Param("authorName") String authorName);
}
