package com.bookstore.dto;

public class AuthorDto {

    private String name;
    private String birthday;

    public AuthorDto() {}

    public AuthorDto(String name, String birthday) {
        this.name = name;
        this.birthday = birthday;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBirthday() { return birthday; }
    public void setBirthday(String birthday) { this.birthday = birthday; }
}
