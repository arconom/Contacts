package com.dotson.controller;

import com.dotson.data.ContactDAO;
import com.dotson.model.Contact;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 *
 * @author arcon
 */
@Path("/Contacts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ContactController {

    public ContactController() {
    }

    @Path("/{id}")
    @GET
    public Response findById(@PathParam("id") long id) {
        ContactDAO dao = new ContactDAO();

        return Response.status(javax.ws.rs.core.Response.Status.OK)
                .entity((List<Contact>) dao.find(id).get(0))
                .build();
    }

    @GET
    public Response find(
            @DefaultValue("%") @QueryParam("firstName") String firstName,
            @DefaultValue("%") @QueryParam("lastName") String lastName,
            @DefaultValue("%") @QueryParam("email") String email,
            @DefaultValue("%") @QueryParam("address") String address,
            @DefaultValue("%") @QueryParam("phone") String phone
    ) {
        ContactDAO dao = new ContactDAO();
        return Response.status(javax.ws.rs.core.Response.Status.OK)
                .entity((List<Contact>) dao.findByQuery(firstName, lastName, email, address, phone).get(0))
                .build();
    }

    @Path("/List")
    @GET
    public Response findAll() {
        ContactDAO dao = new ContactDAO();
        return Response.status(javax.ws.rs.core.Response.Status.OK)
                .entity(new ArrayList<Contact>(dao.findAll()))
                .build();
    }

    @POST
    public Response Create(Contact contact) throws IOException {
        ContactDAO dao = new ContactDAO();

        return contact.isValid() 
                ? dao.insert(contact)
                    ? Response.status(javax.ws.rs.core.Response.Status.OK)
                        .build()
                    : Response.status(javax.ws.rs.core.Response.Status.NOT_MODIFIED)
                        .build()
                : Response.status(javax.ws.rs.core.Response.Status.BAD_REQUEST)
                        .build();

    }

    @Path("{id}")
    @DELETE
    public String Delete(@PathParam("id") long id) {
        ContactDAO dao = new ContactDAO();
        boolean success = dao.delete(id);
        return success ? "success" : "fail";
    }

    @Path("{id}")
    @PUT
    public String Update(Contact contact, @PathParam("id") long id) throws IOException {
        ContactDAO dao = new ContactDAO();
        boolean success = contact.isValid() ? dao.update(id, contact) : false;
        return success ? "success" : "fail";
    }

}
