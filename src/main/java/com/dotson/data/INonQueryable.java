/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.dotson.data;

import java.sql.Statement;

/**
 *
 * @author arcon
 */
public interface INonQueryable {

    /**
     *
     * @param statement
     */
    public void action(Statement statement);
};
