const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const app = express();
const fs=require('fs');
const bcrypt = require('bcrypt'); 
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const session = require('express-session');


app.use(cookieParser( "4c8e9e8fb6e93f6456f3dc5f91794f27ba87ac63e09456119b8a792d4b172b5f"));

//////////////////////////////////////////////////////////////////////
app.use(
    session({
      secret: "4c8e9e8fb6e93f6456f3dc5f91794f27ba87ac63e09456119b8a792d4b172b5f", 
      resave: false,
      saveUninitialized: true,
    })
  );

  function isAuthenticatedClient(req, res, next) {
 
    if (req.session.user && req.session.user.role === 'client') {
      return next();  // User is authenticated and is a client
    } else {
      return res.send(`
        <script>
          alert("Please log in as a client to access this page!");
          window.location.href = "/Login";  // Redirect to the client login page
        </script>
      `);
    }
  }
  
  // Middleware to check if the user is an authenticated admin
  function isAuthenticatedAdmin(req, res, next) {

    if ( req.session.user && req.session.user.role === 'admin') {
      return next();  // User is authenticated and is an admin
    } else {
      return res.send(`
        <script>
          alert("Please log in as an admin to access this page!");
          window.location.href = "/AdminLogin";  // Redirect to the admin login page
        </script>
      `);
    }
  }


// Set up database connection using environment variables
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:  'indra@sql',
    database:'SipsrecruimentTrial'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

const dbPromise = db.promise();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Set default upload path
        let uploadPath =  'public/uploads/resumes';

        // Check if the file field is 'companyLogo' to modify upload path
        if (file.fieldname === 'companyLogo') {
            uploadPath = path.join(__dirname, 'public/uploads/logos');
        }

        // Create the directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        // Pass the upload path to the callback function
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename using timestamp and original file name
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });



// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());





app.get('/Login', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).send('Internal Server Error');
        }});
    res.sendFile(path.join(__dirname, 'public/Login.html'));
});
app.get('/AdminLogin', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).send('Internal Server Error');
        }});
    res.sendFile(path.join(__dirname, 'public/AdminLogin.html'));
});
app.get('/Home/:ApplicantName',isAuthenticatedClient, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Home.html'));
});
app.get('/DisplayJobsPage/:ApplicantName',isAuthenticatedClient, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/DisplayJobsPage.html'));
});

app.get('/ApplyJobPage',isAuthenticatedClient, (req, res) => {

    res.sendFile(path.join(__dirname, 'public/ApplyJobPage.html'));
});
app.get('/AdminDashboard',isAuthenticatedAdmin, (req, res) => {

    res.sendFile(path.join(__dirname, 'public/AdminDashboard.html'));
});

app.get('/EditApplication/:ApplicantName',isAuthenticatedAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/EditApplicantion.html'));
})
app.get('/Applications',isAuthenticatedAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Applications.html'));
})
app.get('/Companies',isAuthenticatedAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Companies.html'));
})
app.get('/AddCompanyPage',isAuthenticatedAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddCompany.html'));
})
app.get('/Company',isAuthenticatedAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Company.html'));
})
app.get('/AddJobPage',isAuthenticatedAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddJobPage.html'));
})
app.get('/AllJobsPage',isAuthenticatedAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AllJobsPage.html'));
})
app.get('/EditJobPage',isAuthenticatedAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/EditJobPage.html'));
})
app.get('/AllApplicantsPage',isAuthenticatedAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AllApplicantsPage.html'));
})
app.get('/EditProfilePage/:ApplicantName',isAuthenticatedClient, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/EditProfilePage.html'));
})
app.get('/ApplicantDetailsPage/:ApplicantName',isAuthenticatedAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ApplicantDetailsPage.html'));
})
app.get('/EditApplicantPage/:ApplicantName',isAuthenticatedAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/EditApplicantPage.html'));
})
app.get('/ForgetPasswordPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ForgetPasswordPage.html'));
})
app.get('/EditAdminPage',isAuthenticatedAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/EditAdminPage.html'));
})
app.get('/RevenueAndReports',isAuthenticatedAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/RevenueAndReports.html'));
})
app.get('/EditPlacedApplicationPage',isAuthenticatedAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/EditPlacedApplicationPage.html'));
})
app.get('/AddPlacedApplicationPage',isAuthenticatedAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/AddPlacedApplicationPage.html'));
})
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ShowJobs.html'));
})
app.get('/LoginToJob',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public/LoginToJobPage.html'));
})

///////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/UserSignupToJobPage', async (req, res) => {
    const { ApplicantName, Password, PhoneNumber, Address, AadharCard,Email,JobTitle,Company,Salary } = req.query;
     if (!ApplicantName || !Password || !PhoneNumber || !Address || !AadharCard) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const hash = await bcrypt.hash(Password, 10);
        const sql = `
            INSERT INTO Applicants 
            (ApplicantName, Password, PhoneNumber, Address, Applied, Accepted, Rejected, AadharCard,Email) 
            VALUES (?, ?, ?, ?, 0, 0, 0, ?,?)`;

        await dbPromise.query(sql, [ApplicantName, hash, PhoneNumber, Address, AadharCard,Email]);
        console.log('User signed up successfully.');
        return res.send(`
            <script>
              alert("Congratulations on successfully signing up! 🎉 Now, you can log in using your credentials");
              window.location.href = "/LoginToJobPage?JobTitle=${JobTitle}&Company=${Company}&Salary=${Salary}";
            </script>
        `);
        
    } catch (err) {
        console.error('Error during user signup:', err);
        res.status(500).send('Server error. Please try again.');
    }
});

app.get('/checkToJobPage', async (req, res) => {
    const { Email, Password,JobTitle,Company,Salary  } = req.query;

    try {
        // Validate input
        if (!Email || !Password) {
            return res.send(`
                <script>
                  alert("Email and password are required!");
                  window.location.href = "/LoginToJobPage?JobTitle=${JobTitle}&Company=${Company}&Salary=${Salary}";
                </script>
            `);
        }

        // Fetch user from the database
        const [users] = await dbPromise.query('SELECT * FROM Applicants WHERE Email = ?', [Email]);
        const user = users[0];

let ApplicantName=user.ApplicantName
        // Debug logs
   

        if (!user) {
            return res.send(`
                <script>
                  alert("Invalid username or password!");
                  window.location.href = "/LoginToJobPage?JobTitle=${JobTitle}&Company=${Company}&Salary=${Salary}";
                </script>
            `);
        }


        // Compare password
        const isMatch = await bcrypt.compare(Password,user.Password);
        if (isMatch) {
            req.session.user = { name: ApplicantName, role: 'client' };



            res.redirect(`/ApplyJobPage?ApplicantName=${ApplicantName}&JobTitle=${JobTitle}&Company=${Company}&Salary=${Salary}`);
        } else {
            res.send(`
                <script>
                  alert("Invalid Email or password!");
                  window.location.href = "/LoginToJobPage?JobTitle=${JobTitle}&Company=${Company}&Salary=${Salary}";
                </script>
            `);
        }
    } catch (err) {
        console.error('Error during user login:', err);
        res.status(500).send('Internal Server Error');
    }
});










///////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/UserSignup', async (req, res) => {
    const { ApplicantName, Password, PhoneNumber, Address, AadharCard,Email } = req.query;
     if (!ApplicantName || !Password || !PhoneNumber || !Address || !AadharCard) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const hash = await bcrypt.hash(Password, 10);
        const sql = `
            INSERT INTO Applicants 
            (ApplicantName, Password, PhoneNumber, Address, Applied, Accepted, Rejected, AadharCard,Email) 
            VALUES (?, ?, ?, ?, 0, 0, 0, ?,?)`;

        await dbPromise.query(sql, [ApplicantName, hash, PhoneNumber, Address, AadharCard,Email]);
        console.log('User signed up successfully.');
        return res.send(`
            <script>
              alert("Congratulations on successfully signing up! 🎉 Now, you can log in using your credentials");
              window.location.href = "/Login";
            </script>
        `);
        
    } catch (err) {
        console.error('Error during user signup:', err);
        res.status(500).send('Server error. Please try again.');
    }
});

app.get('/check', async (req, res) => {
    const { Email, Password } = req.query;

    try {
        // Validate input
        if (!Email || !Password) {
            return res.send(`
                <script>
                  alert("Email and password are required!");
                  window.location.href = "/Login";
                </script>
            `);
        }

        // Fetch user from the database
        const [users] = await dbPromise.query('SELECT * FROM Applicants WHERE Email = ?', [Email]);
        const user = users[0];

let ApplicantName=user.ApplicantName
        // Debug logs
   

        if (!user) {
            return res.send(`
                <script>
                  alert("Invalid username or password!");
                  window.location.href = "/Login";
                </script>
            `);
        }


        // Compare password
        const isMatch = await bcrypt.compare(Password,user.Password);
        if (isMatch) {
            req.session.user = { name: ApplicantName, role: 'client' };
            res.redirect(`/Home/${ApplicantName}`);
        } else {
            res.send(`
                <script>
                  alert("Invalid Email or password!");
                  window.location.href = "/Login";
                </script>
            `);
        }
    } catch (err) {
        console.error('Error during user login:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Route: Admin Signup
app.get('/AdminSignup', async (req, res) => {
    const { AdminName, Password, PhoneNumber,Email } = req.query;

    if (!AdminName || !Password || !PhoneNumber || !Email) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const hash = await bcrypt.hash(Password, 10);
        const sql = `
            INSERT INTO Admins 
            (AdminName, Password, PhoneNumber, Level,Email) 
            VALUES (?, ?, ?, 10,?)`;

        await dbPromise.query(sql, [AdminName, hash, PhoneNumber,Email]);
        
        return res.send(`
            <script>
              alert("SignUp Successful!Log in with your credentials");
              window.location.href = "/AdminLogin";
            </script>
        `);;
    } catch (err) {
        console.error('Error during admin signup:', err);
        res.status(500).send('Server error. Please try again.');
    }
});

// Route: Admin Login
app.get('/checkAdmin', async (req, res) => {
    const { Email, Password } = req.query;  // Use req.query for GET requests

    try {
        // Query the database for the admin by AdminName
        const [rows] = await dbPromise.query('SELECT * FROM Admins WHERE Email = ?', [Email]);
        const admin = rows[0] || null;
let AdminName=admin.AdminName || null;

        if (!admin) {
            return res.send(`
                <script>
                  alert("Invalid Email or password!");
                  window.location.href = "/AdminLogin";
                </script>
            `);
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(Password, admin.Password);
        if (isMatch) {
            // Save session
            req.session.user = { name: AdminName, role: 'admin' };
            req.session.AdminName = AdminName;  // Save the AdminName in the session
            res.redirect(`/AdminDashboard?${AdminName}`);
        } else {
            res.send(`
                <script>
                  alert("Invalid username or password!");
                  window.location.href = "/AdminLogin";
                </script>
            `);
        }
    } catch (err) {
        console.error('Error during admin login:', err);
        res.send(`
            <script>
              alert("Admin Not found!");
              window.location.href = "/AdminLogin";
            </script>
        `);
    }
});

app.get("/AdminData", (req, res) => {

    db.query('SELECT * FROM Admins', (err, results) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        res.status(200).json(results); // Return all the results
    });
})


app.get('/ApplicationData/:ApplicantName', (req, res) => {
    const ApplicantName = req.params.ApplicantName;
  
    db.query('SELECT * FROM Applications where ApplicantName=?',[ApplicantName], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(200).json([]); // Return empty array if no applications found
        }

        res.status(200).json(results); // Return all the results
    });
});


app.get('/TotalApplicationData', (req, res) => {
 
    db.query('SELECT * FROM Applications ORDER BY AppliedDate Asc ',(err, results) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(200).json([]); // Return empty array if no applications found
        }

        res.status(200).json(results); // Return all the results
    });
});

app.get('/ApplicantDetails/:ApplicantName', (req, res) => {
    const ApplicantName = req.params.ApplicantName;

    db.query('SELECT * FROM Applicants WHERE ApplicantName = ?', [ApplicantName], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(200).json([]); // Return an empty array if no applications found
        }

        res.status(200).json(results[0]); // Return the full array of results
    });
});



app.post('/Apply', upload.single('NewResume'), (req, res) => {
    const id = crypto.randomBytes(9).toString('hex');
    const ApplicationId = `Apl-${id}`;

    // Retrieve query parameters
    const { ApplicantName, JobTitle, Company, Salary } = req.query;
    const Description = req.body.Description || null;

    // Retrieve form fields
    const PhoneNumber = req.body.PhoneNumber || null;
    const OldResume = req.body.OldResume || null;  // Get the old resume filename from the form

    // Check if a new resume is uploaded, otherwise use the old resume
    let ResumePath;
    if (req.file) {
        console.log(req.file.filename)
        ResumePath = req.file.filename; // Use the new uploaded file
    } else {
        ResumePath = OldResume; // Use the existing resume if no new file is uploaded
    }

    // Insert into database
    const query = `
        INSERT INTO Applications (ApplicationId, ApplicantName, PhoneNumber, Company, JobRole, AppliedDate, Salary, Resume, Status, Description)
        VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?, 'Pending', ?);
    `;

    db.query(
        query,
        [ApplicationId, ApplicantName, PhoneNumber, Company, JobTitle, Salary, ResumePath, Description],
        (err, result) => {
            if (err) {
                console.error('Error updating application details:', err);
                return res.status(500).send(`  
                       <script>
                  alert("We appreciate your interest towards applying through SiPS Portal. We're now in the process of reviewing your resume and will surely update the status of the job Applied. Thanks again!");
                  window.location.href = "/Home/${ApplicantName}";
                </script>`);
            }
            console.log('Application submitted successfully');
            res.send(`
                <script>
                  alert("We appreciate your interest towards applying through SiPS Portal. We're now in the process of reviewing your resume and will surely update the status of the job Applied. Thanks again!");
                  window.location.href = "/Home/${ApplicantName}";
                </script>
            `);
        }
    );
});


app.get('/JobsData', (req, res) => {
    db.query('SELECT * FROM Jobs ORDER BY PostedDate Asc ', (err, results) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        res.status(200).json(results); // Return all the results
    });
});
app.get('/CompanyiesJobsData', (req, res) => {
    const CompanyName = req.query.CompanyName;
    db.query('SELECT * FROM jobs where company=?',[CompanyName], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (results.length === 0) {
            return res.status(200).json([]); // Return empty array if no jobs found
        }
        res.status(200).json(results); // Return all the results
    });
});



app.get('/getApplicationData/:ApplicationId', (req, res) => {
    const ApplicationId = req.params.ApplicationId;

    const query = 'SELECT * FROM Applications WHERE ApplicationId = ?';
    db.query(query, [ApplicationId], (err, result) => {
        if (err) {
            console.error('Error fetching application:', err);
            return res.status(500).send('Internal Server Error');
        }
        // Serve the HTML file with application data (replace placeholders in the HTML if needed)
        return res.json(result[0]);
    });
});

app.post('/UpdateApplication/:ApplicationId', (req, res) => {
    const ApplicationId=req.params.ApplicationId;
    const {phoneNumber, companyName, position, salary, appliedDate,  status} = req.body;

    const query = `
        UPDATE Applications 
        SET 
            
            PhoneNumber = ?, 
            Company = ?, 
            JobRole = ?, 
            Salary = ?, 
            AppliedDate = ?, 
            Status = ?
        WHERE ApplicationId = ?`;

    db.query(query, [
        phoneNumber, 
        companyName, 
        position, 
        parseInt(salary, 10), 
        appliedDate, 
        status, 
        ApplicationId
    ], (err, result) => {
        if (err) {
            console.error('Error updating application:', err);
            return res.status(500).json({ error: 'Failed to update application' });
        }
       res.send(` <script>
        alert("Application Submited Succesfully!");
        window.location.href = "/AllApplicantsPage";
      </script>`)

    });
});
app.get('/companiesdata', (req, res) => {
    const ApplicationId = req.params.ApplicationId;

    const query = 'SELECT * FROM companies';
    db.query(query,  (err, result) => {
        if (err) {
            console.error('Error fetching application:', err);
            return res.status(500).send('Internal Server Error');
        }
        // Serve the HTML file with application data (replace placeholders in the HTML if needed)
        return res.json(result);
    });
});
app.get('/companydata', (req, res) => {
   
    const CompanyName = req.query.CompanyName;
   
    const query = 'SELECT * FROM companies where CompanyName=?';
    db.query(query,[CompanyName] , (err, result) => {
        if (err) {
            console.error('Error fetching application:', err);
            return res.status(500).send('Internal Server Error');
        }
        // Serve the HTML file with application data (replace placeholders in the HTML if needed)

        return res.json(result);
    });
});

// app.post('/AddCompany',upload.single('companyLogo'), (req, res) => { 
//     const id = crypto.randomBytes(5).toString('hex');
// const {companyName,ContactNumber}=req.body;
// let CompanyLogo=null;
// if (req.file) {
//     CompanyLogo = req.file.filename;  // Set the ResumePath to the new file's filename
// }
// console.log(CompanyLogo)

// const query = 'Insert into companies (CompanyName,ContactNumber,CompanyLogo) values(?,?,?)';
// db.query(query,[companyName,ContactNumber,CompanyLogo] , (err, result) => {
//     if (err) {
//         console.error('Error fetching application:', err);
//         return res.status(500).send(`<script>
//         alert("Company Name Already Exists!");
//         window.location.href = "/companies";
//       </script>`);
//         }
//     // Serve the HTML file with application data (replace placeholders in the HTML if needed)
//     res.send(` <script>
//         alert("Company Added Succesfully!");
//         window.location.href = "/companies";
//       </script>`)
// });

// })

app.post('/AddCompany', upload.single('companyLogo'), (req, res) => {
    const { companyName, ContactNumber } = req.body;
    let CompanyLogo = null;

    // If a company logo is uploaded, set the path
    if (req.file) {
        CompanyLogo = `/uploads/logos/${req.file.filename}`;  // Store the relative path to the image
    }

    // SQL Query to insert company details
    const query = 'INSERT INTO companies (CompanyName, ContactNumber, CompanyLogo) VALUES (?, ?, ?)';
    db.query(query, [companyName, ContactNumber, CompanyLogo], (err, result) => {
        if (err) {
            console.error('Error inserting company:', err);
            return res.status(500).send(`
                <script>
                    alert("Company Name Already Exists!");
                    window.location.href = "/companies";
                </script>
            `);
        }
        
        // Send success message and redirect
        res.send(`
            <script>
                alert("Company Added Successfully!");
                window.location.href = "/companies";
            </script>
        `);
    });
});

app.post('/AddJob', (req, res) => {

    const id = crypto.randomBytes(9).toString('hex');
    const JobId = `job-${id}`;

    const {JobTitle,JobType,Salary,Category,Company,Location,NoOfJobs,EndDate,Budget,Domain,Experience}=req.body;
    const query = 'Insert into jobs (JobId,JobTitle,JobType,Salary,Company,Location,NoOfJobs,PostedDate,EndDate,Fulfilled,Category,Budget,Domain,Experience) values(?,?,?,?,?,?,?,CURDATE() + INTERVAL 1 DAY,?,0,?,?,?,?)';
    db.query(query,[JobId,JobTitle,JobType,Salary,Company,Location,NoOfJobs,EndDate,Category,Budget,Domain,Experience] , (err, result) => {
        if (err) {
            console.error('Error fetching application:', err);
            return res.status(500).send(`<script>
            alert("Job Already Exists!");
            window.location.href = "/companies";
          </script>`);
            }
        // Serve the HTML file with application data (replace placeholders in the HTML if needed)
        res.send(` <script>
            alert("Job Added Succesfully!");
            window.location.href = "/companies";
          </script>`)
    });
    
    }
)
app.get('/getJobData', (req, res) => {

    const JobId = req.query.JobId;
   
    const query = 'SELECT * FROM jobs where JobId=?';
    db.query(query,[JobId] , (err, result) => {
        if (err) {
            console.error('Error fetching application:', err);
            return res.status(500).send('Internal Server Error');
        }
        // Serve the HTML file with application data (replace placeholders in the HTML if needed)
        return res.json(result[0]);
    });
})
app.post('/EditJob', (req, res) => {
    const JobId = req.query.JobId;
    const {
        JobTitle,JobType,Salary,Company,Location,NoOfJobs,PostedDate,EndDate,Fulfilled,Budget,Category,Experience
    } = req.body;

    const query = `
        UPDATE jobs
        SET 
            jobTitle=?, jobType=?, salary=?, company=?, location=?, noOfJobs=?, postedDate=?, endDate=?, fulfilled=?,Budget=?,Category=?,Experience=?
        WHERE JobId = ?`;

    db.query(query, [
        JobTitle,JobType,Salary,Company,Location,NoOfJobs,PostedDate,EndDate,Fulfilled,Budget,Category,Experience, JobId
    ], (err, result) => {
        if (err) {
            console.error('Error updating application:', err);
            return res.status(500).json({ error: 'Failed to update application' });
        }
        
        // Return a JSON response
        res.redirect('/companies');
    });
});






app.get('/AllApplicantsData', (req, res) => {
    db.query('SELECT * FROM Applicants  ',(err, results) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(200).json([]); // Return empty array if no applications found
        }

        res.status(200).json(results); // Return all the results
    });})

app.get('/ApplicantData', (req, res) => {
    const ApplicantName = req.query.ApplicantName;
    db.query('SELECT * FROM Applicants where ApplicantName=?  ',[ApplicantName],(err, results) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (results.length === 0) {
            return res.status(200).json([]); // Return empty array if no applications found
        }

        res.status(200).json(results[0]); // Return all the results
    });


})
app.post('/UpdateApplicant', upload.single('NewResume'), (req, res) => {
    const ApplicantName = req.query.ApplicantName;
    const { phoneNumber, address,Email } = req.body;

    // Use the existing Resume if no new file was uploaded
    let ResumePath = req.body.Resume || null;  // Use the existing resume if no new one is uploaded

    // If a new resume is uploaded, assign it to ResumePath
    if (req.file) {
        ResumePath = req.file.filename;  // Set the ResumePath to the new file's filename
    }

    // SQL query to update applicant's information
    const query = `
        UPDATE Applicants
        SET phoneNumber = ?, address = ?, Resume = ?,Email=?
        WHERE ApplicantName = ?
    `;

    // Execute the query to update the applicant's details
    db.query(query, [phoneNumber, address, ResumePath,Email, ApplicantName], (err, result) => {
        if (err) {
            console.error('Error updating applicant:', err);
            return   res.send(`
                <script>
                alert("Error updating profile!,${err}");
                window.location.href = "/Home/${ApplicantName}";
                </script>
                
                `)
        }

        // Redirect to the applicant's home page after successful update
        res.send(`
            <script>
            alert("Profile Updated Succesfully!");
            window.location.href = "/Home/${ApplicantName}";
            </script>
            
            `)
    });
});


app.post('/AdminUpdateApplicant', (req, res) => {
    const ApplicantName = req.query.ApplicantName;
    const {
        comment,companyName
    } = req.body;

    const query = `
        UPDATE Applicants
        SET 
            Comments=?,currently=?
        WHERE ApplicantName=?`;

    db.query(query, [ comment,companyName,ApplicantName
        
    ], (err, result) => {
        if (err) {
            console.error('Error updating application:', err);
            return res.status(500).json({ error: 'Failed to update application' });
        }
        
        // Return a JSON response
        res.redirect('/AllApplicantsPage');
    });
});

app.get("/DeleteCompany",(req,res)=>{
    const {companyName}=req.query;
    const query = `Delete  from Companies where CompanyName=?`;

db.query(query, [companyName], (err, result) => {
    if (err) {
        console.error('Error updating application:', err);
        return res.status(500).json({ error: 'Failed to update application' });
    }
})
res.send(
`
<script>
alert("${companyName} is deleted");
window.location.href="/Companies"

</script>
`

)
})
app.get("/DeleteJob",(req,res)=>{
    const {JobId}=req.query;
    const query = `Delete  from Jobs where JobId=?`;

db.query(query, [JobId], (err, result) => {
    if (err) {
        console.error('Error updating application:', err);
        return res.status(500).json({ error: 'Failed to update application' });
    }
})
res.send(
`
<script>
alert("Job  deleted");
window.location.href="/Companies"

</script>
`

)
})



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let transporter = nodemailer.createTransport({
    service: 'gmail',
      auth: {
        user: 'chatrapathi12052005@gmail.com', // your email
        pass: 'ikrj obvn cxjr qmyb' // your app password
    }
});
  app.post("/sendOtp", (req, res) => {
    const { Email,Otp } = req.query;  // Email passed in request body
  
    if (!Email) {
      return res.status(400).send("Email is required");
    }
  
    // Setup email data
    const mailOptions = {
      from: "sips",  // sender address
      to: Email,                             // recipient's email
      subject: "Your OTP Code From  Sips",              // Subject line
      text: `${Otp}`,      // OTP in text body
    };
  
    // Send the OTP via email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send('Error sending email');
      }
      console.log('Message sent: %s', info.messageId);
      res.status(200).json({ status: "success", message: "OTP sent successfully" });

    });
  });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////



app.get("/getAdminEmails",(req,res)=>{

    db.query('SELECT Email FROM Admins', (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Error fetching data' });
        }
        
        // Extract only email values into an array
        const emailArray = results.map(row => row.Email);
        
        res.json(emailArray); // Send only the array of emails
    }); 
})

app.get("/getClientEmails",(req,res)=>{

    db.query('SELECT Email FROM Applicants', (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Error fetching data' });
        }
        
        // Extract only email values into an array
        const emailArray = results.map(row => row.Email);
        
        res.json(emailArray); // Send only the array of emails
    }); 
})

app.get('/ResetPassword', async (req, res) => {
    const { Email, Password,Type } = req.query;
    
    if (!Email || !Password || !Type) {

        return res.send(` <script>
            alert('Email and new password are required');
            res.redirect('/ForgetPasswordPage');
            </script>`)
        
    }

    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(Password, 10);


if (Type==="Client") {

        // Update the password in the database
        const query = 'UPDATE Applicants SET Password = ? WHERE Email = ?';
        db.query(query, [hashedPassword, Email], (err, result) => {
            if (err) {
                console.error('Error updating password:', err);
                return  res.send(` <script>
                alert("Internal server error!");
                window.location.href = "/Login";
              </script>`);
            }

            if (result.affectedRows === 0) {
                return  res.send(` <script>
                alert("No User Found With this Email!");
                window.location.href = "/Login";
              </script>`);
            }

           res.redirect("/Login");
        });
    }
    else if (Type==="Admin") {

        const query = 'UPDATE Admins SET Password = ? WHERE Email = ?';
        db.query(query, [hashedPassword, Email], (err, result) => {
            if (err) {
                console.error('Error updating password:', err);
                return  res.send(`
                    <script>
                      alert("Internal server error!");
                      window.location.href = "/Login";
                    </script>
                  `);
               
            }

            if (result.affectedRows === 0) {
                return   res.send(`
                    <script>
                      alert("No User Found With this Email!");
                      window.location.href = "/Login";
                    </script>
                  `);
                 
            }

           res.redirect("/Login");
        });


}    
}
 catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/SpecificApplications', (req, res) => {
    const ApplicantName = req.query.ApplicantName;
    db.query('SELECT * FROM Applications where ApplicantName=?',[ApplicantName],(err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Error fetching data' });
        }
       
        res.json(results); 
    }); 

})


app.get('/SpecificAdminData', (req, res) => {
    const AdminName = req.session.AdminName;

    if (!AdminName) {
        return res.status(401).json({ error: "Unauthorized" });
    }

   

    db.query('SELECT * FROM Admins WHERE AdminName = ?', [AdminName], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Admin not found" });
        }

        res.status(200).json(results[0]); // Send only the first object, not an array
    });
});

app.post('/UpdateAdmin', (req, res) => {

    const AdminName = req.query.AdminName;
    const {
        PhoneNumber,Email
    } = req.body;

    const query = `
        UPDATE Admins
        SET 
            PhoneNumber=?,Email=?
        WHERE AdminName=?`;

    db.query(query, [ PhoneNumber,Email,AdminName
        
    ], (err, result) => {
        if (err) {
            console.log(err)
            
            return res.send(`<script>
                alert("Error updating profile!,${err}");
                window.location.href = "/AdminDashboard";
                </script>`)
        }
        
        // Return a JSON response
        res.redirect('/AdminDashboard');
    });


})


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/PlacedTrendsMonthly', (req, res) => {
    const Year = req.query.Year;  // Get the year from the query parameters

    // Check if Year is provided
    if (!Year) {
        return res.status(400).json({ message: 'Year query parameter is required' });
    }

    // SQL query with the Year filter
    const query = `
      SELECT 
        YEAR(AppliedDate) AS Year,
        MONTH(AppliedDate) AS Month,
        COUNT(ApplicationId) AS TotalApplications,
        COUNT(CASE WHEN Status = 'Placed' THEN 1 END) AS PlacedApplications,
        COUNT(CASE WHEN Status = 'Stage1' THEN 1 END) AS Stage1Applications
      FROM 
        YourTableName
      WHERE
        YEAR(AppliedDate) = ?
      GROUP BY 
        YEAR(AppliedDate),
        MONTH(AppliedDate)
      ORDER BY 
        MONTH(AppliedDate) DESC;
    `;

    // Execute the query, passing the year as a parameter to prevent SQL injection
    db.query(query, [Year], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Error querying database' });
      } else {
        res.json(results);
      }
    });
});

  
  // Route for Yearly Breakdown
  app.get('/PlacedTrendsYearly', (req, res) => {
    const query = `
      SELECT 
        YEAR(AppliedDate) AS Year,
        COUNT(ApplicationId) AS TotalApplications,
        COUNT(CASE WHEN Status = 'Placed' THEN 1 END) AS PlacedApplications,
        COUNT(CASE WHEN Status = 'Stage1' THEN 1 END) AS Stage1Applications
      FROM 
        Applications
      GROUP BY 
        YEAR(AppliedDate)
      ORDER BY 
        YEAR(AppliedDate) asc;
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Error querying database' });
      } else {
        res.json(results);
      }
    });
  });
  

  app.get('/placedApplicants', (req, res) => {

    db.query('SELECT * FROM PlacedApplications ',(err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Error fetching data' });
        }
     
        res.json(results); 
    }); 

  })
  
  app.post('/AddPlacedApplication', (req, res) => {
    const {ApplicationId, ApplicantName, Company, Salary, PaymentReceived, Status } = req.body;
    
    // Query to insert data into PlacedApplications table
    db.query('Insert into PlacedApplications (ApplicationId,ApplicantName, Company, Salary, PaymentReceived, Status) VALUES (?,?, ?, ?, ?, ?)', [ApplicationId,ApplicantName, Company, Salary, PaymentReceived, Status], (err, results) => {
        if (err) {
            return res.send(`
                <script>
                    alert("Error in adding: ${err.message}");
                    window.location.href = '/RevenueAndReports';
                </script>
            `);
        }
        res.send(`
            <script>
                alert("Added Successfully!");
                window.location.href = '/RevenueAndReports';
            </script>
        `);
    });
});



app.get('/PlacedApplicantsDetails', (req, res) => {

    const ApplicationId = req.query.ApplicationId;
    db.query('SELECT * FROM PlacedApplications where ApplicationId=?',[ApplicationId],(err,results) => {
        if (err) {
            res.send(`
                <script>
                    alert("error,${err}");
                    window.location.href = '/RevenueAndReports';
                </script>
            `);
        }
       
        res.json(results[0]); 
    }); 

})

app.post('/EditPlacedApplication', (req, res) => {

const {ApplicationId, ApplicantName, Company, Salary, PaymentReceived, Status } = req.body;

    const query = `
        UPDATE PlacedApplications
        SET 
            ApplicantName=?, Company=?, Salary=?, PaymentReceived=?, Status=?
        WHERE ApplicationId=?`;

    db.query(query, [ApplicantName, Company, Salary, PaymentReceived, Status, ApplicationId], (err, result) => {
        if (err) {
            console.log(err)
            
            return res.send(`<script>
                alert("Error updating profile!,${err}");
                window.location.href = "/AdminDashboard";
                </script>`)
        }
        
        res.send(`<script>
            alert("Updated Successful");
            window.location.href = "/RevenueAndReports";
            </script>`)
        

  })
  })

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(2001, () => {
    console.log("Server is running on port 2001");
});
app.get('/trial', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/trial.html'));
});




// API to handle saving changes
