package com.dotson.model;

import java.util.Set;
import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

public class Contact {

    //<editor-fold defaultstate="collapsed" desc="fields">
    final private long id;

    @Size(min = 0, max = 255)
    private String firstName;
    @Size(min = 0, max = 255)
    private String lastName;
    @Size(min = 0, max = 255)
    @Pattern(regexp = "[\\w.-_]+@[\\w.-_]+\\.[\\w.-_]+", message = "Invalid email address")
    private String email;
    @Size(min = 10, max = 13)
    @Pattern(regexp = "\\d{3}[-.]?\\d{3}[-.]?\\d{4}", message = "Invalid Phone number")
    private String phone;
    @Size(min = 0, max = 1000)
    private String address;
    //</editor-fold>

    //<editor-fold defaultstate="collapsed" desc="constructor">
    public Contact() {
        this.id = -1;
        this.firstName = "";
        this.lastName = "";
        this.email = "";
        this.address = "";
        this.phone = "";
    }

    public Contact(String firstName, String lastName, String email, String address, String phone) {
        this.id = -1;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.address = address;
        this.phone = phone;
    }

    public Contact(long id, String firstName, String lastName, String email, String address, String phone) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.address = address;
        this.phone = phone;
    }

    //</editor-fold>
    //<editor-fold defaultstate="collapsed" desc="properties">
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String value) {
        firstName = value;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String value) {
        lastName = value;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String value) {
        email = value;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String value) {
        phone = value;
    }

    public long getId() {
        return id;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public boolean isValid() {
        ValidatorFactory vf = Validation.buildDefaultValidatorFactory();
        Validator validator = vf.getValidator();
        Set<ConstraintViolation<Contact>> constraintViolations = validator
                .validate(this);

        return constraintViolations.isEmpty();
    }

    //</editor-fold>
}
