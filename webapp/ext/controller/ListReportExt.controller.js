sap.ui.define(['sap/ui/core/mvc/ControllerExtension',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Messaging",
	"sap/fe/core/controllerextensions/MessageHandler",
	"sap/m/MessageToast"
], function (ControllerExtension, Filter, FilterOperator, Messaging, MessageHandler, MessageToast) {
	'use strict';

	return ControllerExtension.extend('fluidra.qm.managehu.managehandlinguints.ext.controller.ListReportExt', {
		// this section allows to extend lifecycle hooks or hooks provided by Fiori elements
		override: {
			/**
			 * Called when a controller is instantiated and its View controls (if available) are already created.
			 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
			 * @memberOf fluidra.qm.managehu.managehandlinguints.ext.controller.ListReportExt
			 */
			onInit: function () {
				// you can access the Fiori elements extensionAPI via this.base.getExtensionAPI
				var oModel = this.base.getExtensionAPI().getModel();
				this._Controller = this.base.getExtensionAPI()._controller;
				this._ExtAPI = this.base.getExtensionAPI();
				this._oListTable = this.getView().byId("fluidra.qm.managehu.managehandlinguints::ManageHandlingUnitsList--fe::table::ManageHandlingUnits::LineItem::Table");
				this._oListTable.attachSelectionChange(this.onRowSelection, this);

				
			}
		},
		onRecordUD: function (oEvent) 
		{
			var oInspLotModel = this._ExtAPI.getModel("InspectionLot");
			var oTable = sap.ui.getCore().byId("table0");
			var oItemSelectedContext = oTable.getSelectedItem().getBindingContext().getObject();
			var aDeferredGroups = oInspLotModel.getDeferredGroups();
			var sBatchGroup = "inspectionLotBatchGroup";
			var oMessageManager = sap.ui.getCore().getMessageManager();

			if (!aDeferredGroups.includes(sBatchGroup)) {
				oInspLotModel.setDeferredGroups(aDeferredGroups.concat([sBatchGroup]));
			}

			var oData = [];
			this._ILFilters.forEach(element => {

				var oPayload = {
					"InspectionLot": element.oValue1,
					"InspLotUsageDecisionLevel": "L",
					"InspectionLotQualityScore": "100",
					"InspLotUsageDecisionCatalog": "3",
					"SelectedCodeSetPlant": oItemSelectedContext.SelectedCodeSetPlant,
					"InspLotUsgeDcsnSelectedSet": oItemSelectedContext.SelectedCodeSet,
					"InspLotUsageDecisionCodeGroup": oItemSelectedContext.UsageDecisionCodeGroup,
					"InspectionLotUsageDecisionCode": oItemSelectedContext.UsageDecisionCode,
					"ChangedDateTime": this._InspCngDtTime.find(cngdt => cngdt.InspectionLot === element.oValue1).ChangedDateTime

				}

				oInspLotModel.create("/A_InspLotUsageDecision", oPayload, {
					groupId: sBatchGroup
				});
			})
			
			// var fnFunction = function () {
			// 	return new Promise(function (fnResolve, fnReject) {
					oInspLotModel.submitChanges({
						groupId: sBatchGroup,
						success: function (oData, oResponse) {

							var aResponses = (oData && oData.__batchResponses) ||
								             (oResponse && oResponse.data && oResponse.data.__batchResponses);

							var oInspModel = this._ExtAPI.getModel("InspectionLot"),
								oModel = this._ExtAPI.getModel();

							var msgText;
							// if (aResponses) {
							// 	aResponses[0].__changeResponses.forEach(function (oResponseItem) {
							// 		
							// 		//*  *// --- Handle Errors ---
							// 		if (oResponseItem.statusCode >= 400) {
							// 			try {
							// 				var oResponseBody = JSON.parse(oResponseItem.response.body);

							// 				oMessageManager.addMessages(oInspModel.mMessages['/A_InspLotUsageDecision'][0])


							// 			} catch (e) { console.error(e); }
							// 		}

							// 		// --- Handle Success Messages (sap-message Header) ---
							// 		else
							// 		{
										
							// 		}
							// 	// 	else if (oResponseItem.headers && oResponseItem.headers["sap-message"]) {
							// 	// 		try {
							// 	// 			var oSapMsg = JSON.parse(oResponseItem.headers["sap-message"]);
							// 	// 			Messaging.addMessages(new sap.ui.core.message.Message({
							// 	// 				message: oSapMsg.message,
							// 	// 				type: sap.ui.core.MessageType.Success,
							// 	// 				target: "",
							// 	// 				persistent: true
							// 	// 			}));
							// 	// 		} catch (e) { console.error(e); }
							// 	// 	}
							// 	});
							// }
							// // var messageModel = (oInspModel.mMessages['/A_InspLotUsageDecision'][0]);
							// // messageModel.setMessageProcessor(this._ExtAPI.getModel());
							// // this._ExtAPI._controller.messageHandler.showMessages();
							// // fnResolve();

							this.onDailogClose();
						}.bind(this),
						// error: fnReject

					});
			// 	}).bind(this);
			// }.bind(this)
			// var mParameters = {
			// 	sActionLabel: "Custom Text"
			// };
			// this._ExtAPI.editFlow.securedExecution(fnFunction, mParameters);
		},

		onafterClose: function (oEvent) {
			
			this._ExtAPI.refresh();
			this._oDialog.destroy();
		},

		onRowSelection: function (oSource) {
			
			var oSelectedContext = oSource.getSource().getSelectedContexts();
			this._ILFilters = [];
			this._InspCngDtTime = [];

			oSelectedContext.forEach(element => {
				if (element.getObject().InspectionLot !== "" || element.getObject().InspectionLot !== undefined) {
					var flag = this._ILFilters.find(oInst => oInst.oValue1 == element.getObject().InspectionLot);

					if (!flag) {
						this._ILFilters.push(
							new sap.ui.model.Filter("InspectionLot", FilterOperator.EQ, element.getObject().InspectionLot));

						this._InspCngDtTime.push({
							InspectionLot: element.getObject().InspectionLot,
							ChangedDateTime: element.getObject().ChangedDateTime
						})
					}
				}
			});

		},

		OnRecordUsageDec: function () {
			var oView = this.getView();
			this._ExtAPI.loadFragment({
				name: "fluidra.qm.managehu.managehandlinguints.ext.fragments.SelectDecisionCodes",
				id: oView.byId(),
				controller: this

			}).then(function (oDialog) {
				

				this._oDialog = oDialog;
				this.getView().addDependent(this._oDialog);
				this._oDialog.open();

			}.bind(this))
		},
		onDailogClose: function (oEvent) {
			this._oDialog.close();

		},

		afterDialogOpen: function (oEvent) {
			
			var oTable = sap.ui.getCore().byId("table0"),
				oItemTemplate = oTable.getAggregation("items")[0];

			oTable.bindItems({
				path: "/UsageCodeVH",
				filters: [
					new Filter({
						filters: this._ILFilters,
						and: false
					})
				],
				template: oItemTemplate.clone()
			});
		},
		onSearch: function (oEvent) {


			var sValue = oEvent.getParameter("newValue");
			var oBinding = sap.ui.getCore().byId("table0").getBinding("items");

			if (!sValue)
				oBinding.filter([]);

			else if (sValue.length < 3)
				return;
			else {
				var oFilter = new Filter({
					filters: [
						new Filter("UsageDecisionCode", FilterOperator.Contains, sValue),
						new Filter("UsageDecisionCodeText", FilterOperator.Contains, sValue),
						new Filter("UsageDecisionCodeGroup", FilterOperator.Contains, sValue),
						new Filter("SelectedCodeSet", FilterOperator.Contains, sValue),
						new Filter("SelectedCodeSetText", FilterOperator.Contains, sValue),
						new Filter("SelectedCodeSetPlant", FilterOperator.Contains, sValue),
						new Filter("InspectionLot", FilterOperator.Contains, sValue)
					],
					and: false
				});
				oBinding.filter(oFilter);
			}


		}
	});
});
