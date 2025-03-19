

create table PlacedApplications(
ApplicationId varchar(40) PK 
ApplicantName varchar(40) 
Company varchar(40) 
Salary bigint 
PaymentReceived varchar(10) 
Status varchar(30)
)

create table admins(
AdminName varchar(30) 
Password varchar(100) 
PhoneNumber varchar(15) 
Level bigint 
Email varchar(100))

create table applicants(
ApplicantName varchar(30) PK 
Password varchar(100) 
PhoneNumber varchar(25) 
Address varchar(250) 
Applied bigint 
Accepted bigint 
Rejected bigint 
AadharCard varchar(250) 
Comments varchar(650) 
Currently varchar(50) 
Resume varchar(250) 
Email varchar(100)
)

create table applications(
ApplicantName varchar(30) PK 
Password varchar(100) 
PhoneNumber varchar(25) 
Address varchar(250) 
Applied bigint 
Accepted bigint 
Rejected bigint 
AadharCard varchar(250) 
Comments varchar(650) 
Currently varchar(50) 
Resume varchar(250) 
Email varchar(100)

)

create table companies(
    CompanyName varchar(50) PK 
ContactNumber varchar(25)
)

create table jobs(
    JobId varchar(30) 
JobTitle varchar(30) 
JobType varchar(30) 
Salary bigint 
Company varchar(30) 
Location varchar(30) 
NoOfJobs int 
PostedDate date 
EndDate date 
Fulfilled bigint
)