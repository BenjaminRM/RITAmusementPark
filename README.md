# Semester Project - RITAmusementPark
### Data Security and Privacy (CSCI-622)
#### Rachael Thormann (rjt4819@rit.edu) & Benjamin Mitchell (brm1947@rit.edu)
###### Group 05

***

##### Description
Rochester Institute of Technology's imaginary theme park (regretably not branded as Tiger Town) is a simple online application which
allows visitors of the park to sign up and explore the website. Visitors will be able to buy membership to the park, buy merchandise,
view their ride statistics, and other park news & information. Employees will also be able to use the website (through their employee login)
to view their time worked, schedule, department, and request days off. Supervisors will also be able to view their employees in the department
they are in charge of, validate time off requests, and request maintenance for broken or malfunctioning rides. The owner of the park will also
have a login and role in order to dictate who is promoted to supervisor, and to monitor the happenings of the park. An admin role also exists to
login on the front end in order to get a quick view of the audit logs, error messages, and user activity from a simple dashboard.

***

##### Purpose
Given the task of exploring real-world practices of data security and privacy, we decided to use a realistic development stack, 
and public facing site in order to put security principals to the test. Our goal was to use a common development stack that was 
both easy to get started with, but had advanced features we could choose to expand on or not. Using Amazon Web Services as our 
go-to for hosting the database and application server gave us a fresh perspective on some existing and commonly used technologies.

***

##### Application Usage & Testing

###### Live Testing
**www.ritamusementpark.net**

This project is meant to be tested live. In it's current state, basic visitor and admin dashboards are functioning. By default when you sign up
and login to the system, you will be a 'visitor' - the most basic of users.

    1. Visitor
        Sign up and Login following the instructions. Remember this is an imaginary site, so please **_don't use any real information or personal passwords!_**
    2. Employee
        Not currently working.
    3. Supervisor
        Not currently working.
    4. Owner
        Not currently working.
    5. Admin 
        Test credentials:
            Email: AdminTestUser@ritamusementpark.net
            Password: 72hGLj!%oKzZvB

Any of the "Not currently working." user types simply don't have logic in place when the login. Visitors and Admins are partially functioning according
to the role descriptions found in the project description section above.

###### Local Testing
Just to include this here: yes, you can test this locally, but there is no database. We have our database for the live application hosted on AWS's
Relational Database Service (RDS), and if you want to test locally you need to set up environment credentials for the database to work.

You will be able to get the application running, but only the home page, login page, and sign up page will work. Anything with the dashboards will
not be able to be reached.

***
