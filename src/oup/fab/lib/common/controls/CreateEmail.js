/*!
 * ${copyright}
 */
// Provides control oup.fab.lib.common.CreateEmail.
jQuery.sap.includeStyleSheet(
  jQuery.sap.getResourcePath("oup/fab/lib/common/css/CreateEmail.css")
);

sap.ui.define(
  [
    "./../library",
    "./../util/CommonModelManager",
    "./../util/Formatter",
    "sap/ui/core/Control",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/Button",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  function (
    library,
    CommonModelManager,
    Formatter,
    Control,
    Fragment,
    Filter,
    FilterOperator,
    JSONModel,
    Button,
    MessageToast,
    MessageBox
  ) {
    "use strict";

    /**
     * Constructor for a new CreateEmail control.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @class
     * Some class description goes here.
     * @extends sap.ui.core.Control
     *
     * @author SAP SE
     * @version 1.0.0
     *
     * @constructor
     * @public
     * @alias oup.fab.lib.common.controls.CreateEmail
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    const CreateEmail = Control.extend(
      "oup.fab.lib.common.controls.CreateEmail",
      {
        metadata: {
          library: "oup.fab.lib.common",
          properties: {
            appID: {
              type: "string",
              defaultValue: null,
            },
          },
          events: {},
          aggregations: {
            container: {
              type: "sap.ui.core.Control",
              multiple: false,
              visibility: "hidden",
            },
          },
        },

        init: function () {
          if (Control.prototype.init) {
            Control.prototype.init.apply(this, arguments);
          }

          // start global busy indicator
          sap.ui.core.BusyIndicator.show(0);

          // local model initialization
          let oData = {
            sendEmailButtonEnable: false,
            selectedTemplateID: "",
            selectedLanguage: "E",
            emailRecipients: "",
            emailCcRecipients: "",
            emailSubject: "",
            emailHTMLResponse: "",
            notes: "",
          };
          this._oCreateEmailModel = new JSONModel(oData);
          this.setModel(this._oCreateEmailModel, "CreateEmailModel");

          // oData model initialization
          CommonModelManager.loadMetadataModel();

          // load local models for the fragment
          jQuery.sap.delayedCall(250, this, () => this._loadModels());

          // resource bundle initialization
          let oI18NModel = CommonModelManager.getI18NModel();
          this._oResourceBundle = oI18NModel.getResourceBundle();
          this.setModel(oI18NModel, "i18n");

          this._oButton = new Button({
            text: "{i18n>CreateEmail.BtnText}",
            press: this._onCreateEmailBtnPress.bind(this),
          });

          this.setAggregation("container", this._oButton);
        },

        onToChange: function (oEvent) {
          let oInput = oEvent.getSource();
          this._validateInput(oInput);
        },

        onCcChange: function (oEvent) {
          let oInput = oEvent.getSource();
          this._validateInput(oInput);
        },

        onTemplateChange: function (oEvent) {
          let oSource = oEvent.getSource();
          let oSelectedItem = oSource.getSelectedItem();

          if (oSelectedItem) {
            // start global busy indicator
            sap.ui.core.BusyIndicator.show(0);

            let oObject = oSelectedItem
              .getBindingContext("TemplatesModel")
              .getObject();
            this._loadLanguge(oObject.TemplateID)
              .then(() => {
                this._loadEmailTemplate(false, null);
              })
              .finally(() => {
                // end global busy indicator
                sap.ui.core.BusyIndicator.hide();
              });
          }
        },

        onTemplateLanguageChange: function () {
          this._loadEmailTemplate(false, null);
          // this._loadNotes();
        },

        onAdditionalTextLiveChange: function (oEvent) {
          let oNotes = oEvent.getParameters("value");
          this._loadEmailTemplate(false, oNotes.newValue);
        },

        onCreateEmailDialogSendEmailPress: function () {
          try {
            // start busy indicator
            sap.ui.core.BusyIndicator.show(0);

            // validate
            // this._handleValidations();

            // load generated email template
            this._loadEmailTemplate(true, null).then(() => {
              // close the dialog on success of mail sent
              this.onCreateEmailDialogCancelPress();

              // end busy indicator
              sap.ui.core.BusyIndicator.hide();
            });
          } catch (error) {
            // error message
            MessageToast.show(
              this._oResourceBundle.getText("CreateEmail.ValidationError")
            );
          }
        },

        onCreateEmailDialogCancelPress: function () {
          // close the create email dialog
          sap.ui.getCore().byId("createEmailDialogId").close();
        },

        /***********************************************************************/
        /*                          INTERNAL METHODS                           */
        /***********************************************************************/

        _onCreateEmailBtnPress: function () {
          // start busy indicator
          sap.ui.core.BusyIndicator.show(0);

          const fnEndBusyIndicator = function () {
            // end busy indicator
            sap.ui.core.BusyIndicator.hide();
          };

          this._loadDialog()
            .then((oDialog) => {
              // open dialog
              oDialog.open();

              // load generated email template
              this._loadEmailTemplate(false, null).finally(fnEndBusyIndicator);
            })
            .catch(() => {
              // error message
              MessageToast.show(
                this._oResourceBundle.getText("CreateEmail.DialogLoadError")
              );
            })
            .finally(fnEndBusyIndicator);
        },

        _loadDialog: function () {
          return new Promise((resolve, reject) => {
            let oDialog = sap.ui.getCore().byId("createEmailDialogId");

            // load fragment
            if (!oDialog) {
              Fragment.load({
                name: "oup.fab.lib.common.view.fragment.CreateEmailDialog",
                controller: this,
              })
                .then((oFragment) => {
                  // add dependent
                  this.addDependent(oFragment);

                  // sync style sheet
                  oFragment.addStyleClass(Formatter.getDensity());

                  // return dialog
                  resolve(oFragment);
                })
                .catch((_error) => {
                  // falied to load dialog
                  reject();
                });
            } else {
              resolve(oDialog);
            }
          });
        },

        _handleValidations: function () {
          // collect input controls
          const oCore = sap.ui.getCore(),
            aInputs = [oCore.byId("nameInput"), oCore.byId("emailInput")],
            bValidationError = false;

          // Check that inputs are not empty.
          // Validation does not happen during data binding as this is only triggered by user actions.
          aInputs.forEach(
            (oInput) =>
              (bValidationError =
                this._validateInput(oInput) || bValidationError)
          );

          if (!bValidationError) {
            MessageToast.show(
              "The input is validated. Your form has been submitted."
            );
          } else {
            MessageBox.alert(
              "A validation error has occurred. Complete your input first."
            );
          }
        },

        _validateInput: function (oInput) {
          let sValueState = "None";
          let bValidationError = false;

          try {
            let sValue = oInput.getValue();

            // if input is cc it is not mandatory for sending email
            if (sValue.trim() === "") {
              // skip no validation
            } else {
              // validate multiple emails seprated by , or ;
              let oMailRegex = /^(\w([-_+.']*\w+)+@(\w(-*\w+)+\.)+[a-zA-Z]{2,4}[,;])*\w([-_+.']*\w+)+@(\w(-*\w+)+\.)+[a-zA-Z]{2,4}$/g;
              if (!oMailRegex.test(sValue)) {
                throw Error();
              }
            }
          } catch (oException) {
            sValueState = "Error";
            bValidationError = true;

            // focus on delay
            setTimeout(() => oInput.focus(), 50);
          }

          oInput.setValueState(sValueState);

          // enable send email button
          // if (bEmailInput || bValidationError) {
          let bCreateBtnEnable = false;
          let oCreateEmailModel = this.getModel("CreateEmailModel");
          if (sValueState !== "Error") {
            let oCreateEmail = oCreateEmailModel.getData();
            bCreateBtnEnable = oCreateEmail.emailRecipients !== "";
          }
          oCreateEmailModel.setProperty(
            "/sendEmailButtonEnable",
            bCreateBtnEnable
          );
          // }
          return bValidationError;
        },

        _loadEmailTemplate: function (bSave, sNotesLiveChange) {
          return new Promise((resolve, reject) => {
            let oCreateEmailModel = this.getModel("CreateEmailModel");
            let oCreateEmail = oCreateEmailModel.getData();
            let oData = {
              CaseGuid: "",
              EmailTemplate: oCreateEmail.selectedTemplateID,
              EmailID: "",
              EmailTemplateLanguage: oCreateEmail.selectedLanguage,
              EmailRecipients: oCreateEmail.emailRecipients,
              EmailCcRecipients: oCreateEmail.emailCcRecipients,
              EmailSubject: "",
              EmailBodyHtml: "",
              EmailBodyText: "",
              EmailSendIndicator: bSave,
              FreeDefinedNote:
                sNotesLiveChange === null
                  ? oCreateEmail.notes
                  : sNotesLiveChange,
              LastChangeDateTime: new Date(),
            };

            // get email template
            CommonModelManager.createMail(oData)
              .then((oDataResponse) => {
                if (!bSave) {
                  // set in create mail model
                  oCreateEmailModel.setProperty(
                    "/emailRecipients",
                    oDataResponse.EmailRecipients
                  );
                  oCreateEmailModel.setProperty(
                    "/emailCcRecipients",
                    oDataResponse.EmailCcRecipients
                  );
                  oCreateEmailModel.setProperty(
                    "/emailSubject",
                    oDataResponse.EmailSubject
                  );
                  oCreateEmailModel.setProperty(
                    "/emailHTMLResponse",
                    oDataResponse.EmailBodyHtml
                  );

                  // set email template to iframe
                  let oIframDomRef = jQuery.sap.byId(
                    sap.ui.getCore().byId("emailTemplateId").getId()
                  );

                  let oIframeBody = oIframDomRef.contents().find("body");
                  oIframeBody[0].innerHTML = oDataResponse.EmailBodyHtml;
                }
                resolve();
              })
              .catch((_error) => reject());
          });
        },

        _loadModels: function () {
          const sAppID = this.getProperty("appID");

          // filters
          let aFilter = [];

          // application id
          aFilter.push(new Filter("AppID", FilterOperator.EQ, sAppID));

          // get templates promise
          let aTemplatePromise = new Promise((resolve, reject) => {
            return CommonModelManager.getEntitysetWithFilters(
              "/SE_TemplateSet",
              []
            )
              .then((aDataResponse) => {
                this.setModel(new JSONModel(aDataResponse), "TemplatesModel");

                // load language for the first template
                if (aDataResponse.length !== 0) {
                  this.getModel("CreateEmailModel").setProperty(
                    "/selectedTemplateID",
                    aDataResponse[0].TemplateID
                  );
                  this._loadLanguge(aDataResponse[0].TemplateID);
                }

                resolve();
              })
              .catch((_error) => reject());
          });

          Promise.all([aTemplatePromise]).finally(() => {
            // end global busy indicator
            sap.ui.core.BusyIndicator.hide();
          });
        },

        _loadLanguge: function (sEmailTemplate) {
          // filters
          let aFilter = [];

          // application id
          aFilter.push(new Filter("ID", FilterOperator.EQ, sEmailTemplate));

          // get languages promise
          return new Promise((resolve, reject) => {
            return CommonModelManager.getEntitysetWithFilters(
              "/SE_LANGUAGESet",
              aFilter
            )
              .then((aDataResponse) => {
                this.setModel(new JSONModel(aDataResponse), "LanguagesModel");

                if (aDataResponse.length !== 0) {
                  // if english language is available default to 'E'
                  let aEnglishAvailable = aDataResponse.filter((oData) => {
                    return oData.Langu === "E";
                  });

                  if (aEnglishAvailable.length !== 0) {
                    this.getModel("CreateEmailModel").setProperty(
                      "/selectedLanguage",
                      "E"
                    );
                  } else {
                    this.getModel("CreateEmailModel").setProperty(
                      "/selectedLanguage",
                      aDataResponse[0].Langu
                    );
                  }
                }

                resolve();
              })
              .catch((_error) => reject());
          });
        },

        _loadNotes: function (sAppID) {
          // filters
          let aFilter = [];

          // application id
          aFilter.push(new Filter("AppID", FilterOperator.EQ, sAppID));

          // get notes promise
          return new Promise((resolve, reject) => {
            return CommonModelManager.getEntitysetWithFilters(
              "/SE_NOTESSet",
              aFilter
            )
              .then((aDataResponse) => {
                this.setModel(new JSONModel(aDataResponse), "NotesModel");
                resolve();
              })
              .catch((_error) => reject());
          });
        },

        renderer: function (oRM, oControl) {
          oRM.renderControl(oControl.getAggregation("container"));
        },
      }
    );

    return CreateEmail;
  },
  /* bExport= */ true
);
