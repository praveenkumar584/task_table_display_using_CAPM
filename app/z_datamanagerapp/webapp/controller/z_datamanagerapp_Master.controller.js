sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], (Controller,MessageBox, MessageToast) => {
    "use strict";
    return Controller.extend("zdatamanagerapp.controller.z_datamanagerapp_Master", {
        onInit() 
        {
             this.getView().setModel(new sap.ui.model.json.JSONModel(), "selected");
        },
        onAdd:function ()
        {
            const oView = this.getView();
            const oData = {
                basicInfo: {
                    employeeID: "",
                    firstName: "",
                    lastName: "",
                    jobTitle: ""
                },
                details: {
                    gender: "",
                    email: "",
                    department: "",
                    employmentType: "",
                    maritalStatus: "",
                    salary: null,
                    birthDate: null,
                    hireDate: null,
                    address: "",
                    city: "",
                    region: "",
                    postalCode: "",
                    country: "",
                    phoneNumber: "",
                    emergencyContactName: "",
                    emergencyContactPhone: "",
                    reportsTo: ""
                }
            };
            const oModel = new sap.ui.model.json.JSONModel(oData);
            oView.setModel(oModel, "emp");
            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment(
                    oView.getId(),
                    "zdatamanagerapp.view.z_datamanagerapp_dataCollector",
                    this
                );
                oView.addDependent(this.oDialog);
            }
            this.oDialog.open();
        },
        onSaveEmployee: async function ()
        {
            const oModel = this.getView().getModel("emp");
            const basicInfo = oModel.getProperty("/basicInfo");
            const details = oModel.getProperty("/details");

            try
            {
                if (!basicInfo.employeeID || !basicInfo.firstName || !basicInfo.lastName)
                {
                    return sap.m.MessageBox.error("EmployeeID, First Name, and Last Name are mandatory.");
                }
                const response = await fetch("/odata/v4/z-service-employee-info/addEmployee", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ basicInfo, details })
                });

                if (!response.ok)
                {
                    let msg = `Failed to add employee. Status: ${response.status}`;
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json"))
                    {
                        const errData = await response.json();
                        msg = errData.error?.message || msg;
                    }
                    throw new Error(msg);
                }
                const result = await response.json();
                sap.m.MessageBox.success("Employee added successfully");
                if (this.oDialog)
                {
                    this.oDialog.close();
                }

            } 
            catch (err)
            {
                sap.m.MessageBox.error(err.message);
                console.error(err);
            }
            this.byId("_IDGenTable").getBinding("items").refresh();
        },
        onCancelDialog:function()
        {
            console.log("Closed");
            if (this.oDialog)
            {
                this.oDialog.close();
                sap.m.MessageToast.show("closed");
            }
            else
            {
                console.error("Dialog instance is not created");
            }
        },
        //Basic Table Update API
        onEdit: async function ()
        {
            const oTable = this.byId("_IDGenTable");
            const oSelectedItem = oTable.getSelectedItem();
            if (!oSelectedItem)
            {
                sap.m.MessageBox.warning("Please select an employee first.");
                return;
            }
            const oContext = oSelectedItem.getBindingContext();
            this.selectedEmployee = oContext.getObject();
            if (!this.editDialog)
            {
                this.editDialog = await sap.ui.core.Fragment.load({
                    name: "zdatamanagerapp.view.z_datamanagerapp_editEmployee",
                    controller: this
                });
                this.getView().addDependent(this.editDialog);
            }
            sap.ui.getCore().byId("empId").setValue(this.selectedEmployee.employeeID);
            sap.ui.getCore().byId("firstName").setValue(this.selectedEmployee.firstName);
            sap.ui.getCore().byId("lastName").setValue(this.selectedEmployee.lastName);
            sap.ui.getCore().byId("jobTitle").setValue(this.selectedEmployee.jobTitle);
            this.editDialog.open();
        },
        onCancelEdit: function ()
        {
            if (this.editDialog)
            {
                this.editDialog.close();
            }
        },
        onSaveEdit: async function ()
        {
            const employeeID = sap.ui.getCore().byId("empId").getValue();
            const firstName  = sap.ui.getCore().byId("firstName").getValue();
            const lastName   = sap.ui.getCore().byId("lastName").getValue();
            const jobTitle   = sap.ui.getCore().byId("jobTitle").getValue();
            const payload = {
                basicInfo: {
                    employeeID,
                    firstName,
                    lastName,
                    jobTitle
                }
            };
            try
            {
                const response = await fetch("/odata/v4/z-service-employee-info/updateBasicInfo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!response.ok)
                {
                    const error = await response.json();
                    throw new Error(error.error?.message || "Failed to update employee.");
                }
                const result = await response.text();
                sap.m.MessageToast.show("Updated Successfully");
                this.editDialog.close();
            } 
            catch (err)
            {
                sap.m.MessageBox.error(err.message);
            }
            this.byId("_IDGenTable").getBinding("items").refresh();
        },


        //Delete API functionality
        onDelete: async function ()
        {
            const oTable = this.byId("_IDGenTable");
            const oSelected = oTable.getSelectedItem();
            if (!oSelected)
            {
                sap.m.MessageBox.warning("Please select an employee first.");
                return;
            }
            const employeeID = oSelected.getBindingContext().getProperty("employeeID");
            const bConfirm = await new Promise((resolve) => {
                MessageBox.confirm(
                    `Are you sure you want to delete Employee ID: ${employeeID}?`,
                    {
                        title: "Confirm Delete",
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                        onClose: (sAction) => resolve(sAction === sap.m.MessageBox.Action.OK)
                    }
                );
            });
            if (!bConfirm) 
            {
                return;
            }
            try
            {
                const response = await fetch("/odata/v4/z-service-employee-info/deleteEmployee", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ employeeID })
                });
                if (!response.ok)
                {
                    const errorMessage = await response.text();
                    throw new Error(errorMessage);
                }
                sap.m.MessageBox.success("Deleted Successfully");

            }
            catch (err)
            {
                sap.m.MessageBox.error("Delete failed: " + err.message);
                console.error(err);
            }
            this.byId("_IDGenTable").getBinding("items").refresh();
            var oPanel = this.byId("_IDGenPanel");
            oPanel.setVisible(false);

        },
        //Refresh Functionality
        onRefresh:function()
        {
            var oModel = this.getView().getModel();
            var oTable = this.byId("_IDGenTable");
            var oPanel = this.byId("_IDGenPanel");
            if (oModel && oModel.refresh)
            {
                oModel.refresh();
            }
            oTable.removeSelections(true);
            var oSelectedModel = this.getView().getModel("selected");
            oSelectedModel.setData({});
            oPanel.setVisible(false);
            this.selectedEmployeeID = null;
            sap.m.MessageToast.show("Data refreshed successfully");
        },
        onSelect: async function (oEvent)
        {
            const oSelectedItem = oEvent.getParameter("listItem");
            const oCtx = oSelectedItem.getBindingContext();
            const sEmpId = oCtx.getProperty("employeeID");
            const oModel = this.getView().getModel();
            try
            {
                const oBinding = oModel.bindContext(`/EmployeeBasicInfo(${sEmpId})?$expand=moreInfo`);
                const oData = await oBinding.requestObject();
                if (oData && oData.moreInfo)
                {
                    const oSelected = new sap.ui.model.json.JSONModel(oData.moreInfo);
                    this.getView().setModel(oSelected, "selected");
                    const sHeader = `More Details of ${oData.firstName} ${oData.lastName}`;
                    this.getView().byId("_IDGenPanel").setHeaderText(sHeader);
                    this.getView().byId("_IDGenPanel").setVisible(true);
                } 
                else
                {
                    sap.m.MessageToast.show("No MoreInfo data found.");
                }

            }
            catch (err)
            {
                console.error(err);
                sap.m.MessageToast.show("Error while fetching details.");
            }
        },
        //Edit at the Panel level Data
        onEditPanelData:function()
        {
            this.byId("_IDGenPanel").setVisible(false); 
            const oPanel = this.byId("moreInfoPanel");
            oPanel.setVisible(true);
        },
        onSaveMoreInfo: async function ()
        {
            const data = this.getView().getModel("selected").getData();
            const payload = 
            {
                details: {
                    employeeID: data.employeeID,
                    email: data.email,
                    department: data.department,
                    employmentType: data.employmentType,
                    maritalStatus: data.maritalStatus,
                    birthDate: data.birthDate,
                    gender: data.gender,
                    salary: data.salary,
                    hireDate: data.hireDate,
                    address: data.address,
                    city: data.city,
                    region: data.region,
                    postalCode: data.postalCode,
                    country: data.country,
                    phoneNumber: data.phoneNumber,
                    emergencyContactName: data.emergencyContactName,
                    emergencyContactPhone: data.emergencyContactPhone,
                    reportsTo: data.reportsTo
                }
            };
            try
            {
                const response = await fetch("/odata/v4/z-service-employee-info/updateMoreInfo", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok)
                {
                    const errorText = await response.text();
                    throw new Error(errorText);
                }
                const result = await response.text();
                sap.m.MessageBox.success("Updated successfully");
                this.byId("moreInfoPanel").setVisible(false);
                this.byId("_IDGenPanel").setVisible(true);
              

            }
            catch (err)
            {
                sap.m.MessageBox.error("Update Failed: " + err.message);
            }
        },
        onCloseMoreInfoEditPanel:function()
        {
            this.byId("_IDGenPanel").setVisible(true);
            this.byId("moreInfoPanel").setVisible(false);
        },
        closePanel: function()
        {
            const oView = this.getView();
            const oPanel = oView.byId("_IDGenPanel");
            oPanel.setVisible(false);
            const oTable = oView.byId("_IDGenTable");
            oTable.removeSelections(true);
            const oSelectedModel = oView.getModel("selected");
            oSelectedModel.setData({});
            sap.m.MessageToast.show("closed more Details Panel")
        }

    });
});