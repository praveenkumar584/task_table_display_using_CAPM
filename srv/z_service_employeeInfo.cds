using { employeeDB as edb } from '../db/z_datamodel_employees';
service z_service_employeeInfo {

    entity EmployeeBasicInfo as projection on edb.EmployeeBasicInfo
    {
        employeeID,
        firstName,
        lastName,
        jobTitle,
        moreInfo: redirected to EmployeesMoreInfo
    };
    entity EmployeesMoreInfo as projection on edb.EmployeesMoreInfo;

    type EmployeeBasicInput
    {
        employeeID:Integer;
        firstName:String;
        lastName:String;
        jobTitle:String;
    };

    type EmployeeMoreInput
    {
        gender:String;
        email:String;
        department:String;
        employmentType:String;
        maritalStatus:String;
        salary:Decimal(10);
        birthDate:Date;
        hireDate:Date;
        address:String;
        city:String;
        region:String;
        postalCode:String;
        country:String;
        phoneNumber:String;
        emergencyContactName:String;
        emergencyContactPhone:String;
        reportsTo: String;
    };
    action addEmployee(basicInfo:EmployeeBasicInput, details:EmployeeMoreInput) returns String;
    action updateBasicInfo(basicInfo: EmployeeBasicInput) returns String;
    action updateMoreInfo(details: EmployeeMoreInput) returns String;
    action deleteEmployee(employeeID: Integer) returns String;
}