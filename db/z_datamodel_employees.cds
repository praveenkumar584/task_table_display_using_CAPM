namespace employeeDB;

entity EmployeeBasicInfo
{
    key employeeID:Integer @unique @mandatory @assert.format:'^[A-Za-z0-9]+$';
    firstName:String @mandatory @assert.format:'^[A-Za-z ]+$';
    lastName:String @mandatory @assert.format:'^[A-Za-z ]+$';
    jobTitle:String @mandatory;
    
    moreInfo:Association to EmployeesMoreInfo on moreInfo.employeeID = $self.employeeID;
}

entity EmployeesMoreInfo
{
    key employeeID:Integer;
    gender:String @assert.enum:['Male', 'Female', 'Other'];
    email:String @mandatory @assert.format:'email';
    department:String @mandatory;
    employmentType:String @assert.enum:['Full Time', 'Part Time', 'Contract'];
    maritalStatus:String @assert.enum:['married', 'unmarried'];
    salary:Decimal(10) @assert.range:{ min:0 };
    birthDate:Date @assert.format:'date';
    hireDate:Date @assert.format:'date';
    address:String;
    city:String;
    region:String;
    postalCode:String;
    country:String;
    phoneNumber:String @assert.pattern:'^[0-9]{10}$';
    emergencyContactName:String;
    emergencyContactPhone:String @assert.pattern:'^[0-9]{10}$';
    reportsTo:String @mandatory;

    basicInfo : Association to EmployeeBasicInfo on basicInfo.employeeID = $self.employeeID;
}
