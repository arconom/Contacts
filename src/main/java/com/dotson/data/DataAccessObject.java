/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.dotson.data;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author arcon
 */
public class DataAccessObject {

    private String connectionString;

    /**
     *
     * @return
     */
    public String getConnectionString() {
        return connectionString;
    }

    /**
     *
     * @param connectionString
     */
    public void setConnectionString(String connectionString) {
        this.connectionString = connectionString;
    }

    /**
     *
     */
    public DataAccessObject() {
    }

    /**
     *
     * @param connectionString
     */
    public DataAccessObject(String connectionString) {
        this.connectionString = connectionString;
    }

    /**
     * Connect to the test.db database
     *
     * @return the Connection object
     */
    private Connection connect(String connectionString) {
        String url = connectionString;
        Connection conn = null;
        try {
            Class.forName("org.sqlite.JDBC");
            conn = DriverManager.getConnection(url);
        } catch (SQLException e) {
            Logger.getLogger(ContactDAO.class.getName()).log(Level.SEVERE, null, e);
        } catch (ClassNotFoundException e) {
            Logger.getLogger(ContactDAO.class.getName()).log(Level.SEVERE, null, e);
        }
        return conn;
    }

//    public boolean tableExists(String tableName) {
//        String sql = "SELECT name FROM sqlite_master WHERE type='table' AND name='" + tableName + "'";
//        DatabaseMetaData meta = con.getMetaData();
//        List<String> returnMe = getResultSet(sql, new IQueryable() {
//            @Override
//            public String action(ResultSet resultSet) {
//                try {
//                    return resultSet.getString("name");
//                } catch (SQLException ex) {
//                    Logger.getLogger(ContactDAO.class.getName()).log(Level.SEVERE, null, ex);
//                    return null;
//                }
//            }
//        });
//
//        return !returnMe.isEmpty();
//    }
    public boolean tableExists(String tableName) {
        Connection connection = connect(connectionString);
        boolean returnMe = false;
        try {
            DatabaseMetaData md = connection.getMetaData();
            ResultSet rs = md.getTables(null, null, tableName, null);
            rs.next();
            returnMe = rs.getRow() > 0;
            connection.close();
        } catch (SQLException ex) {
            Logger.getLogger(ContactDAO.class.getName()).log(Level.SEVERE, null, ex);
        }
        return returnMe;
    }

    /**
     *
     * @param <T>
     * @param sql
     * @param query
     * @return
     */
    public <T> List getResultSet(String sql, IQueryable query) {
        Connection connection = connect(getConnectionString());
        Statement statement = null;
        List<T> returnMe = new ArrayList<T>();

        try {
            connection.setAutoCommit(false);
            System.out.println("Opened database successfully");

            statement = connection.createStatement();
            ResultSet resultSet = statement.executeQuery(sql);

            while (resultSet.next()) {
                returnMe.add((T) query.action(resultSet));
            }
            resultSet.close();
            statement.close();
            connection.close();
        } catch (Exception e) {
            Logger.getLogger(ContactDAO.class.getName()).log(Level.SEVERE, null, e);
            return null;
        }
        System.out.println("Operation done successfully");

        return returnMe;
    }

    /**
     *
     * @param query
     * @param autoCommit
     */
    public boolean executeNonQuery(INonQueryable query, boolean autoCommit) {
        Connection connection = connect(getConnectionString());
        Statement statement = null;
        boolean returnMe = false;

        try {
            System.out.println("Opened database successfully");
            connection.setAutoCommit(autoCommit);
            statement = connection.createStatement();

            query.action(statement);

            statement.close();
            if (!autoCommit) {
                connection.commit();
            }
            connection.close();
        } catch (Exception e) {
            Logger.getLogger(ContactDAO.class.getName()).log(Level.SEVERE, null, e);
            returnMe = false;
        }
        return returnMe;
    }
}
