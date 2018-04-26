/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.dotson.model;

import junit.framework.TestCase;

/**
 *
 * @author arcon
 */
public class ContactTest extends TestCase {
    
    public ContactTest(String testName) {
        super(testName);
    }
    
    @Override
    protected void setUp() throws Exception {
        super.setUp();
    }
    
    @Override
    protected void tearDown() throws Exception {
        super.tearDown();
    }

    /**
     * Test of isValid method, of class Contact.
     */
    public void testIsValid() {
        System.out.println("isValid");

        Contact validInstance = new Contact();
        validInstance.setAddress("address");
        validInstance.setEmail("email.address@server.com");
        validInstance.setFirstName("first");
        validInstance.setLastName("last");
        validInstance.setPhone("0123456789");

        Contact failEmailInstance = new Contact();
        failEmailInstance.setAddress("address");
        failEmailInstance.setEmail("fail");
        failEmailInstance.setFirstName("first");
        failEmailInstance.setLastName("last");
        failEmailInstance.setPhone("0123456789");

        Contact failPhoneInstance = new Contact();
        failPhoneInstance.setAddress("address");
        failPhoneInstance.setEmail("email.address@server.com");
        failPhoneInstance.setFirstName("first");
        failPhoneInstance.setLastName("last");
        failPhoneInstance.setPhone("fail");
        
        assertEquals(true, validInstance.isValid());
        assertEquals(false, failEmailInstance.isValid());
        assertEquals(false, failPhoneInstance.isValid());
    }
}
