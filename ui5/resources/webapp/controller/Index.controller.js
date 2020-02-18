sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/library",
	"../model/formatter"
], function (Controller, Fragment, JSONModel, unifiedLibrary, formatter) {
	"use strict";

	var CalendarDayType = unifiedLibrary.CalendarDayType;

	return Controller.extend("roombook.ui5.controller.Index", {
		formatter: formatter,
		onInit: function () {
			this._setApiOdata();
			this._setTimeModel();
			this._setRoomMode();
			this._setFilterOnTodayMettingTiles();
			this._checkForUpdates();
		},

		_setApiOdata: function () {
			const oApi = new sap.ui.model.odata.v4.ODataModel({
				groupId: "$direct",
				synchronizationMode: "None",
				operationMode: "Server",
				serviceUrl: "/api/",
			});

			this.getView().setModel(oApi);
		},

		_setFilterOnTodayMettingTiles: function () {
			let startOfDay = new Date();
			let endOfDay = new Date();

			startOfDay.setHours(0, 0, 0);
			endOfDay.setHours(23, 59, 59);

			const dateTimeOffsetFormater = new sap.ui.model.odata.type.DateTimeOffset({}, {
				V4: true
			});
			const oDataStartOfDay = dateTimeOffsetFormater.parseValue(startOfDay, "object");
			const oDataEndOfDay = dateTimeOffsetFormater.parseValue(endOfDay, "object");

			const oRoomFilter = new sap.ui.model.Filter("room_ID", "EQ", "f5f96661-bd88-4a8a-866d-750aa865ebd0");
			const oTodayFilter = new sap.ui.model.Filter({
				path: 'startAt',
				operator: sap.ui.model.FilterOperator.BT,
				value1: oDataStartOfDay,
				value2: oDataEndOfDay
			});



			const oFlexBox = this.getView().byId("todayMettingTiles");
			oFlexBox.getBinding("items").filter([oRoomFilter, oTodayFilter]);
		},

		_setTimeModel: function () {
			const oTimeModel = new JSONModel();

			oTimeModel.setData({
				startDate: new Date(),
				currentTime: this._getCurrentTime()
			});

			this.getView().setModel(oTimeModel, "timeModel");
			this._changeCurrentTime();
		},

		_setRoomMode: function () {
			const oRoomModel = new JSONModel();

			oRoomModel.setData({
				status: 'Success',
				statusDescription: 'Wolne'
			});

			this.getView().setModel(oRoomModel, "roomModel");

		},

		_getCurrentTime: function () {
			const now = new Date();
			return `${now.getHours()}:${('0' +now.getMinutes()).slice(-2)}`;
		},

		_changeCurrentTime: function () {
			setTimeout(() => {
				const oTimeModel = this.getView().getModel("timeModel");
				oTimeModel.setProperty("/currentTime", this._getCurrentTime());
				setTimeout(this._changeCurrentTime(), 1000);
			}, 1000);
		},

		onDataEvents: function (oEvent) {
			const oRoomModel = this.getView().getModel("roomModel");
			const now = new Date();
			let status = 'Success';
			let statusDescription = 'Wolne';
			
			const aReservations = oEvent.getSource().getContexts();
			aReservations.forEach(oReservation => {
				const { startAt, endAt } = oReservation.getValue();
				const startAtDate = new Date(startAt);
				const endAtDate = new Date(endAt);

				const startAtDateUtc = new Date(startAtDate.getTime() + startAtDate.getTimezoneOffset() * 60000);
				const endAtDateUtc = new Date(endAtDate.getTime() + endAtDate.getTimezoneOffset() * 60000);

				if(startAtDateUtc <= now && endAtDateUtc >= now) {
					status = 'Error';
					statusDescription = `Zajęte do ${endAtDateUtc.getHours()}:${endAtDateUtc.getMinutes()}`;
				}
			});
			oRoomModel.setProperty("/status", status);
			oRoomModel.setProperty("/statusDescription", statusDescription);
		},

		_refreshModel: function () {
			this.getView().getModel().refresh();
		},		

		_checkForUpdates: function () {
			setTimeout(() => {
				this._refreshModel();
				setTimeout(this._checkForUpdates(), 60000);
			}, 60000);
		},



		/* Create Appointment */
		_arrangeDialogFragment: function (sTitle) {
			if (!this._oNewAppointmentDialog) {
				Fragment.load({
					id: "dialogFrag",
					name: "sap.m.sample.SinglePlanningCalendarCreateApp.Modify",
					controller: this
				})
				.then(function(oDialog){
					this._oNewAppointmentDialog = oDialog;
					this.getView().addDependent(this._oNewAppointmentDialog);
				}.bind(this));
			}
		},

		handleAppointmentCreate: function () {
			if (!this._oNewAppointmentDialog) {
				Fragment.load({
					id: "appointmentDialog",
					name: "roombook.ui5.view.Modify",
					controller: this
				})
				.then(function(oDialog){
					this._oNewAppointmentDialog = oDialog;
					this.getView().addDependent(this._oNewAppointmentDialog);
					this._oNewAppointmentDialog.open();
					// this._arrangeDialog(sTitle);
				}.bind(this));
			} else {
				this._oNewAppointmentDialog.open();
			}
		},

		handleDialogOkButton: function () {
		  	const sTitle = Fragment.byId("appointmentDialog", "title").getValue();
		  	const sDescription = Fragment.byId("appointmentDialog", "description").getValue();
			const oStartDate = Fragment.byId("appointmentDialog", "DTPStartDate").getDateValue();
			const oEndDate = Fragment.byId("appointmentDialog", "DTPEndDate").getDateValue();

			const dateTimeOffsetFormater = new sap.ui.model.odata.type.DateTimeOffset({}, {
				V4: true
			});
				
			const sODataStartDate = dateTimeOffsetFormater.parseValue(oStartDate, "object");
			const sODataEndDate = dateTimeOffsetFormater.parseValue(oEndDate, "object");				

			if (Fragment.byId("appointmentDialog", "DTPStartDate").getValueState() !== "Error" && Fragment.byId("appointmentDialog", "DTPEndDate").getValueState() !== "Error") {
				const oAppointmentsBinding = this.getView().byId("planningCalendar").getBinding("appointments");
				const oContext = oAppointmentsBinding.create({
					"room_ID": "f5f96661-bd88-4a8a-866d-750aa865ebd0",
					"title": sTitle,
					"description": sDescription,
					"startAt": sODataStartDate,
					"endAt": sODataEndDate
				});

					oContext.created().then(() => { 
						this._refreshModel();
						this._oNewAppointmentDialog.close();
					}, function (oError) {
						// handle rejection of entity creation; if oError.canceled === true then the transient entity has been deleted 
					});								
			}
		},

		handleDialogCancelButton:  function () {
			this._oNewAppointmentDialog.close();
		},		
	});
});