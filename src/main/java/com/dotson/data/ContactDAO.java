package com.dotson.data;

import com.dotson.model.Contact;
import java.sql.*;
import java.util.Formatter;
import java.util.List;
import java.util.Locale;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author arcon
 */
public class ContactDAO extends DataAccessObject {

    /**
     *
     */
    public ContactDAO() {
        super("jdbc:sqlite:contacts.db");

        //make sure the table exists
        try {
            if (!tableExists("Contact")) {
                //if not, create it
                createTable();
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    /**
     * Create the Contact table
     */
    public boolean createTable() {
        return executeNonQuery(new INonQueryable() {
            @Override
            public void action(Statement statement) {

                String sql = "CREATE TABLE CONTACT "
                        + "("
                        + "ID INTEGER   PRIMARY KEY    AUTOINCREMENT,"
                        + " FIRSTNAME           TEXT    NOT NULL, "
                        + " LASTNAME           TEXT    NOT NULL, "
                        + " EMAIL          TEXT    NOT NULL, "
                        + " ADDRESS        TEXT    NOT NULL, "
                        + " PHONE          TEXT    NOT NULL"
                        + ")";
                try {
                    statement.executeUpdate(sql);
                } catch (SQLException ex) {
                    Logger.getLogger(ContactDAO.class.getName()).log(Level.SEVERE, null, ex);
                }
                System.out.println("Contact Table created successfully");
            }
        }, true);
    }

    /**
     * Insert a new record into the Contact table with the specified values
     *
     * @param contact {Contact} - an object containing the data to be persisted
     */
    public boolean insert(final Contact contact) {
        return executeNonQuery(new INonQueryable() {
            @Override
            public void action(Statement statement) {
                StringBuilder sql = new StringBuilder();
                // Send all output to the Appendable object sb
                Formatter formatter = new Formatter(sql, Locale.US);
                formatter.format("INSERT INTO CONTACT (FIRSTNAME,LASTNAME,EMAIL,ADDRESS,PHONE)"
                        + "VALUES ('%1$s', '%2$s', '%3$s', '%4$s', '%5$s');",
                        contact.getFirstName(),
                        contact.getLastName(),
                        contact.getEmail(),
                        contact.getAddress(),
                        contact.getPhone());
                try {
                    statement.executeUpdate(sql.toString());
                } catch (SQLException ex) {
                    Logger.getLogger(ContactDAO.class.getName()).log(Level.SEVERE, null, ex);
                }
                System.out.println("Contact Table created successfully");
            }
        }, true);
    }

    /**
     * Query the CONTACT table for a record with the given ID
     *
     * @param id {long} - unique identifier
     * @return a List<Contact> of length 1. It returns a List currently because
     * I didn't want to write another query type.
     */
    public List find(long id) {
        return getResultSet("SELECT * FROM CONTACT WHERE ID = " + Long.toString(id) + ");", new IQueryable() {
            @Override
            public Contact action(ResultSet resultSet) {
                try {

                    return new Contact(
                            (long) resultSet.getInt("id"),
                            resultSet.getString("FIRSTNAME"),
                            resultSet.getString("LASTNAME"),
                            resultSet.getString("EMAIL"),
                            resultSet.getString("ADDRESS"),
                            resultSet.getString("PHONE"));

                } catch (SQLException ex) {
                    Logger.getLogger(ContactDAO.class.getName()).log(Level.SEVERE, null, ex);
                    return null;
                }
            }
        });
    }

    /**
     * Queries the Contact table for all rows defaulting empty values to
     * wildcards
     *
     * @return List<Contact>
     */
    public List findByQuery(String firstName, String lastName, String email, String address, String phone) {

        StringBuilder sql = new StringBuilder();
        Formatter formatter = new Formatter(sql, Locale.US);
        formatter.format("SELECT * "
                + "FROM CONTACT "
                + "WHERE FIRSTNAME = '%1$s'"
                + "AND LASTNAME = '%2$s'"
                + "AND EMAIL = '%3$s'"
                + "AND ADDRESS = '%4$s'"
                + "AND PHONE = '%5$s'"
                + ";",
                firstName.isEmpty() ? '%' : firstName,
                lastName.isEmpty() ? '%' : lastName,
                email.isEmpty() ? '%' : email,
                address.isEmpty() ? '%' : address,
                phone.isEmpty() ? '%' : phone
        );

        return getResultSet(sql.toString(), new IQueryable() {
            @Override
            public Contact action(ResultSet resultSet) {
                try {
                    return new Contact(
                            (long) resultSet.getInt("id"),
                            resultSet.getString("FIRSTNAME"),
                            resultSet.getString("LASTNAME"),
                            resultSet.getString("EMAIL"),
                            resultSet.getString("ADDRESS"),
                            resultSet.getString("PHONE"));

                } catch (SQLException ex) {
                    Logger.getLogger(ContactDAO.class.getName()).log(Level.SEVERE, null, ex);
                    return null;
                }
            }
        });
    }

    /**
     * Queries the Contact table for all rows
     *
     * @return List<Contact>
     */
    public List findAll() {
        return getResultSet("SELECT * FROM CONTACT;", new IQueryable() {
            @Override
            public Contact action(ResultSet resultSet) {
                try {
                    return new Contact(
                            (long) resultSet.getInt("id"),
                            resultSet.getString("FIRSTNAME"),
                            resultSet.getString("LASTNAME"),
                            resultSet.getString("EMAIL"),
                            resultSet.getString("ADDRESS"),
                            resultSet.getString("PHONE"));
                } catch (SQLException ex) {
                    Logger.getLogger(ContactDAO.class.getName()).log(Level.SEVERE, null, ex);
                    return null;
                }
            }
        });
    }

    public Integer getCount() {
        return (Integer) getResultSet(
                "SELECT count(*) AS total FROM Contact",
                new IQueryable() {
            @Override
            public Integer action(ResultSet resultSet) {
                try {
                    return resultSet.getInt("total");
                } catch (SQLException ex) {
                    Logger.getLogger(ContactDAO.class.getName()).log(Level.SEVERE, null, ex);
                    return -1;
                }
            }
        }).get(0);
    }

    /**
     * Update the row in the Contact table with the specified ID to the
     * specified values
     *
     * @param id {long} - unique identifier
     * @param contact {Contact} - an object containing the data to be persisted
     */
    public boolean update(final long id, final Contact contact) {
        return executeNonQuery(new INonQueryable() {
            @Override
            public void action(Statement statement) {
                StringBuilder sql = new StringBuilder();
                Formatter formatter = new Formatter(sql, Locale.US);
                formatter.format("UPDATE CONTACT "
                        + "set"
                        + " FIRSTNAME = '%1$s'"
                        + ", LASTNAME = '%2$s'"
                        + ", EMAIL = '%3$s'"
                        + ", ADDRESS = '%4$s'"
                        + ", PHONE = '%5$s'"
                        + " where ID = '%6$s';",
                        contact.getFirstName(),
                        contact.getLastName(),
                        contact.getEmail(),
                        contact.getAddress(),
                        contact.getPhone(),
                        Long.toString(id)
                );

                System.out.println(sql);
                try {
                    statement.executeUpdate(sql.toString());
                } catch (SQLException ex) {
                    Logger.getLogger(ContactDAO.class.getName()).log(Level.SEVERE, null, ex);
                }
                System.out.println("Contact Table created successfully");
            }
        }, false);
    }

    /**
     * Delete the record from the Contact table with the specified ID
     *
     * @param id {long} - unique identifier
     */
    public boolean delete(final long id) {
        return executeNonQuery(new INonQueryable() {
            @Override
            public void action(Statement statement) {
                String sql = "DELETE FROM CONTACT WHERE ID=" + Long.toString(id) + ";";

                try {
                    statement.executeUpdate(sql);
                } catch (SQLException ex) {
                    Logger.getLogger(ContactDAO.class.getName()).log(Level.SEVERE, null, ex);
                }
                System.out.println("Contact Table created successfully");
            }
        }, false);
    }
}
