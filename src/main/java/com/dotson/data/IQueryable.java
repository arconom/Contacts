/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.dotson.data;

import java.sql.ResultSet;

/**
 *
 * @author arcon
 */
public interface IQueryable {

    /**
     *
     * @param <T>
     * @param resultSet
     * @return
     */
    public <T> T action(ResultSet resultSet);
};
