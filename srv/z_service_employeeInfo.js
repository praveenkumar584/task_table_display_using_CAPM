const cds = require('@sap/cds');
module.exports = cds.service.impl(async function () {
    const { EmployeeBasicInfo, EmployeesMoreInfo } = this.entities;
    
    //API for insert into EmployeeBasicInfo,EmployeeMoreInfo

    this.on('addEmployee', async (req) => {
        const { basicInfo, details } = req.data;
        if (!basicInfo || !details)
        {
            return req.reject(400,'No partial data allowed.');
        }
        if (!basicInfo.employeeID)
        {  
            return req.reject(400, 'EmployeeBasicInfo: employeeID is mandatory.');
        }
        if (!basicInfo.firstName)
        {
            return req.reject(400, 'EmployeeBasicInfo: firstName is mandatory.');
        }
        if (!basicInfo.lastName)
        {
            return req.reject(400, 'EmployeeBasicInfo: lastName is mandatory.');
        }
        if (!basicInfo.jobTitle) 
        {
            return req.reject(400, 'EmployeeBasicInfo: jobTitle is mandatory.');
        }
        if (!/^[A-Za-z0-9]+$/.test(basicInfo.employeeID))
        {
            return req.reject(400, 'EmployeeBasicInfo: employeeID must be alphanumeric.');
        }
        if (!/^[A-Za-z ]+$/.test(basicInfo.firstName))
        {
            return req.reject(400, 'EmployeeBasicInfo: firstName can contain only letters and spaces.');
        }   
        if (!/^[A-Za-z ]+$/.test(basicInfo.lastName))
        {
            return req.reject(400, 'EmployeeBasicInfo: lastName can contain only letters and spaces.');
        }
        const genders = ['Male', 'Female', 'Other'];
        const employmentTypes = ['Full Time', 'Part Time', 'Contract'];
        const maritalStatuses = ['married', 'unmarried'];
        if (!details.gender || !genders.includes(details.gender))
        {
            return req.reject(400, `EmployeesMoreInfo: gender must be one of ${genders.join(', ')}.`);
        }
        if (!details.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email))
        {
            return req.reject(400, 'EmployeesMoreInfo: Invalid email format.');
        }
        if (!details.department)
        {
            return req.reject(400, 'EmployeesMoreInfo: department is mandatory.');
        }
        if(details.employmentType && !employmentTypes.includes(details.employmentType))
        {
            return req.reject(400, `EmployeesMoreInfo: employmentType must be one of ${employmentTypes.join(', ')}.`);
        }
        if (details.maritalStatus && !maritalStatuses.includes(details.maritalStatus))
        {
            return req.reject(400, `EmployeesMoreInfo: maritalStatus must be one of ${maritalStatuses.join(', ')}.`);
        }
        if (details.salary != null && details.salary < 0)
        {
            return req.reject(400, 'EmployeesMoreInfo: salary must be >= 0.');
        }
        if (details.phoneNumber && !/^[0-9]{10}$/.test(details.phoneNumber))
        {
            return req.reject(400, 'EmployeesMoreInfo: phoneNumber must be 10 digits.');
        }
        if (details.emergencyContactPhone && !/^[0-9]{10}$/.test(details.emergencyContactPhone))
        {
            return req.reject(400, 'EmployeesMoreInfo: emergencyContactPhone must be 10 digits.');
        }
        if (!details.reportsTo) 
        {
            return req.reject(400, 'EmployeesMoreInfo: reportsTo is mandatory.');
        }
        if(details.birthDate && isNaN(Date.parse(details.birthDate)))
        {
            return req.reject(400, 'EmployeesMoreInfo: birthDate must be a valid date.');
        }
        if (details.hireDate && isNaN(Date.parse(details.hireDate)))
        {
            return req.reject(400, 'EmployeesMoreInfo: hireDate must be a valid date.');
        }
        try
        {
            details.employeeID = basicInfo.employeeID;
            await INSERT.into(EmployeeBasicInfo).entries({ ...basicInfo });
            await INSERT.into(EmployeesMoreInfo).entries({ ...details });
            return { message: `Employee ${basicInfo.employeeID} inserted successfully in both tables.` };

        } 
        catch (err) 
        {
            return req.reject(500, 'Database insert failed: ' + err.message);
        }
    });

    //update API for EmployeeBasicInfo

    this.on('updateBasicInfo', async (req) => {
        const { basicInfo } = req.data;
        if (!basicInfo?.employeeID)
        {
            return req.reject(400, 'EmployeeBasicInfo: employeeID is mandatory.');
        }
        try
        {
            const affected = await UPDATE(EmployeeBasicInfo).set(basicInfo).where({ employeeID: basicInfo.employeeID });
            if (affected === 0)
            {
                return req.reject(404, `Employee ${basicInfo.employeeID} not found.`);
            }
            return `EmployeeBasicInfo for ${basicInfo.employeeID} updated successfully.`;

        }
        catch (err)
        {
            return req.reject(500, 'Update failed: ' + err.message);
        }
    });
    //Update API for EmployeeMoreInfo
    this.on('updateMoreInfo', async (req) => {
        const { details } = req.data;
        if (!details?.employeeID)
        {
            return req.reject(400, 'EmployeesMoreInfo: employeeID is mandatory.');
        }
        try
        {
            const affected = await UPDATE(EmployeesMoreInfo).set(details).where({ employeeID: details.employeeID });
            if (affected === 0)
            {
                return req.reject(404, `EmployeesMoreInfo for ${details.employeeID} not found.`);
            }
            return `EmployeesMoreInfo for ${details.employeeID} updated successfully.`;

        }
        catch (err)
        {
            return req.reject(500, 'Update failed: ' + err.message);
        }
    });
    //Delete API for both tables
    this.on('deleteEmployee', async (req) => {
        const { employeeID } = req.data;
        if (!employeeID)
        {
            return req.reject(400, 'employeeID is required.');
        }
        try
        {
            await DELETE.from(EmployeesMoreInfo).where({ employeeID });
            const affected = await DELETE.from(EmployeeBasicInfo).where({ employeeID });
            if (affected === 0)
            {
                return req.reject(404, `Employee ${employeeID} not found.`);
            }
            return `Employee ${employeeID} deleted successfully from both tables.`;

        }
        catch (err)
        {
            return req.reject(500, 'Delete failed: ' + err.message);
        }
    });
});
