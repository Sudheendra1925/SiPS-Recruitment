const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const app = express();
const fs=require('fs');
const bcrypt = require('bcrypt'); 

const cookieParser = require('cookie-parser');
const session = require('express-session');









app.use(cookieParser( "4c8e9e8fb6e93f6456f3dc5f91794f27ba87ac63e09456119b8a792d4b172b5f"
));

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
          window.location.href = "/";  // Redirect to the client login page
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
        const uploadsDir = path.join(__dirname, 'public/uploads/resumes');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir); // Save files to 'uploads/resumes'
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Create unique file names
    }
});

const upload = multer({ storage: storage });



// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());





app.get('/', (req, res) => {
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



app.get('/UserSignup', async (req, res) => {
    const { ApplicantName, Password, PhoneNumber, Address, AadharCard } = req.query;
console.log(ApplicantName, Password, PhoneNumber, Address, AadharCard)
    if (!ApplicantName || !Password || !PhoneNumber || !Address || !AadharCard) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const hash = await bcrypt.hash(Password, 10);
        const sql = `
            INSERT INTO Applicants 
            (ApplicantName, Password, PhoneNumber, Address, Applied, Accepted, Rejected, AadharCard) 
            VALUES (?, ?, ?, ?, 0, 0, 0, ?)`;

        await dbPromise.query(sql, [ApplicantName, hash, PhoneNumber, Address, AadharCard]);
        console.log('User signed up successfully.');
        res.redirect('/');
    } catch (err) {
        console.error('Error during user signup:', err);
        res.status(500).send('Server error. Please try again.');
    }
});

// Route: User Login


app.get('/check', async (req, res) => {
    const { ApplicantName, Password } = req.query;

    try {
        // Validate input
        if (!ApplicantName || !Password) {
            return res.send(`
                <script>
                  alert("Username and password are required!");
                  window.location.href = "/";
                </script>
            `);
        }

        // Fetch user from the database
        const [users] = await dbPromise.query('SELECT * FROM Applicants WHERE ApplicantName = ?', [ApplicantName]);
        const user = users[0];

        // Debug logs
   

        if (!user) {
            return res.send(`
                <script>
                  alert("Invalid username or password!");
                  window.location.href = "/";
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
                  alert("Invalid username or password!");
                  window.location.href = "/";
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
    const { AdminName, Password, PhoneNumber } = req.query;
console.log(AdminName, Password, PhoneNumber)
    if (!AdminName || !Password || !PhoneNumber) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const hash = await bcrypt.hash(Password, 10);
        const sql = `
            INSERT INTO Admins 
            (AdminName, Password, PhoneNumber, Level) 
            VALUES (?, ?, ?, 10)`;

        await dbPromise.query(sql, [AdminName, hash, PhoneNumber]);
        console.log('Admin signed up successfully.');
        res.redirect('/AdminLogin');
    } catch (err) {
        console.error('Error during admin signup:', err);
        res.status(500).send('Server error. Please try again.');
    }
});

// Route: Admin Login
app.get('/checkAdmin', async (req, res) => {
    const { AdminName, Password } = req.query;  // Use req.query for GET requests

    try {
        // Query the database for the admin by AdminName
        const [rows] = await dbPromise.query('SELECT * FROM Admins WHERE AdminName = ?', [AdminName]);
        const admin = rows[0];

        if (!admin) {
            return res.send(`
                <script>
                  alert("Invalid username or password!");
                  window.location.href = "/AdminLogin";
                </script>
            `);
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(Password, admin.Password);
        if (isMatch) {
            // Save session
            req.session.user = { name: AdminName, role: 'admin' };
            res.redirect(`/AdminDashboard`);
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
        res.status(500).send('Internal Server Error');
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
    console.log(ApplicantName);
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
console.log(results)
        res.status(200).json(results[0]); // Return the full array of results
    });
});


app.post('/Apply', upload.single('Resume'), (req, res) => {
    const id = crypto.randomBytes(9).toString('hex');
    const ApplicationId = `Apl-${id}`;

    // Retrieve query parameters
    const { ApplicantName, JobTitle, Company, Salary } = req.query;
    const Description = req.body.Description || null;

    // Retrieve form fields
    const PhoneNumber = req.body.PhoneNumber || null;

    // Get the resume file path, if uploaded
    const ResumePath = req.file ? req.file.filename : null;

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
                return res.status(500).send('Error updating application details');
            }
            console.log('Application submitted successfully');
            res.send(`
                <script>
                  alert("Application Submitted Successfully!");
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
    console.log(CompanyName)
    db.query('SELECT * FROM jobs where company=?',[CompanyName], (err, results) => {
        console.log(results);
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
    const {
       
        phoneNumber, 
        companyName, 
        position, 
        salary, 
        appliedDate, 
        status
    } = req.body;

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
        window.location.href = "/AdminDashboard";
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

app.post('/AddCompany', (req, res) => { 
    const id = crypto.randomBytes(5).toString('hex');
   

const {companyName,contactNumber}=req.body;

const query = 'Insert into companies (CompanyName,JobsPosted,JobsDelivered,ContactNumber) values(?,0,0,?)';
db.query(query,[companyName,contactNumber] , (err, result) => {
    if (err) {
        console.error('Error fetching application:', err);
        return res.status(500).send(`<script>
        alert("Company Name Already Exists!");
        window.location.href = "/companies";
      </script>`);
        }
    // Serve the HTML file with application data (replace placeholders in the HTML if needed)
    res.send(` <script>
        alert("Company Added Succesfully!");
        window.location.href = "/companies";
      </script>`)
});

})



app.post('/AddJob', (req, res) => {

    const id = crypto.randomBytes(9).toString('hex');
    const JobId = `job-${id}`;

    const {JobTitle,JobType,Salary,Company,Location,NoOfJobs,EndDate}=req.body;
    const query = 'Insert into jobs (JobId,JobTitle,JobType,Salary,Company,Location,NoOfJobs,PostedDate,EndDate,Fulfilled) values(?,?,?,?,?,?,?,CURDATE() + INTERVAL 1 DAY,?,0)';
    db.query(query,[JobId,JobTitle,JobType,Salary,Company,Location,NoOfJobs,EndDate] , (err, result) => {
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
        JobTitle,JobType,Salary,Company,Location,NoOfJobs,PostedDate,EndDate,Fulfilled
    } = req.body;

    const query = `
        UPDATE jobs
        SET 
            jobTitle=?, jobType=?, salary=?, company=?, location=?, noOfJobs=?, postedDate=?, endDate=?, fulfilled=?
        WHERE JobId = ?`;

    db.query(query, [
        JobTitle,JobType,Salary,Company,Location,NoOfJobs,PostedDate,EndDate,Fulfilled, JobId
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
console.log(results)
        if (results.length === 0) {
            return res.status(200).json([]); // Return empty array if no applications found
        }

        res.status(200).json(results[0]); // Return all the results
    });


})

app.post('/UpdateApplicant', (req, res) => {
    const ApplicantName = req.query.ApplicantName;
    const {
       phoneNumber,address
    } = req.body;

    const query = `
        UPDATE Applicants
        SET 
            phoneNumber=?,address=?
        WHERE ApplicantName=?`;

    db.query(query, [ phoneNumber,address,ApplicantName
        
    ], (err, result) => {
        if (err) {
            console.error('Error updating application:', err);
            return res.status(500).json({ error: 'Failed to update application' });
        }
        
        // Return a JSON response
        res.redirect('/companies');
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
        res.redirect('/companies');
    });
});


app.listen(2001, () => {
    console.log("Server is running on port 2001");
});
app.get('/trial', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/trial.html'));
});




// API to handle saving changes
