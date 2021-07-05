/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
  [
    "oup/fab/lib/common/util/ErrorHandler",
    "sap/ui/base/Object",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (
    ErrorHandler,
    UI5Object,
    ODataModel,
    ResourceModel,
    Filter,
    FilterOperator
  ) {
    "use strict";

    // service urls
    var _sServiceUrl = "/sap/opu/odata/sap/ZGLBFAB_COMMON_SRV/";

    // global place holders
    var _oModel;
    var _oI18NModel;
    var _oErrorHandler;

    var CommonModelManager = UI5Object.extend(
      "oup.fab.lib.common.util.CommonModelManager",
      {}
    );

    // get service url
    CommonModelManager.getServiceUrl = () => {
      return _sServiceUrl;
    };

    // load or initialize the meta data model
    CommonModelManager.loadMetadataModel = () => {
      if (!_oModel) {
        _oModel = new ODataModel(CommonModelManager.getServiceUrl(), {
          disableHeadRequestForToken: true,
          useBatch: true,
        });
        _oErrorHandler = new ErrorHandler(
          _oModel,
          CommonModelManager.getI18NModel()
        );
      }
    };

    // get metadata model
    CommonModelManager.getModel = () => {
      if (!_oModel) {
        _oModel = new ODataModel(CommonModelManager.getServiceUrl(), {
          disableHeadRequestForToken: true,
          useBatch: true,
        });
        _oErrorHandler = new ErrorHandler(
          _oModel,
          CommonModelManager.getI18NModel()
        );
      }
      return _oModel;
    };

    // get resource bundle model
    CommonModelManager.getI18NModel = () => {
      if (!_oI18NModel) {
        _oI18NModel = new ResourceModel({
          bundleName: "oup.fab.lib.common.messagebundle",
        });
      }
      return _oI18NModel;
    };

    // ger error handler
    CommonModelManager.getErrorHandler = () => {
      if (!_oErrorHandler) {
        CommonModelManager.getModel();
      }
      return _oErrorHandler;
    };

    // load general entityset with filters
    CommonModelManager.getEntitysetWithFilters = (sEntity, aFilter) => {
      return new Promise((resolve, reject) => {
        var aEntityFilter = aFilter.length === 0 ? [] : aFilter;
        var oModel = CommonModelManager.getModel();
        oModel.metadataLoaded().then(() => {
          oModel.read(sEntity, {
            filters: aEntityFilter,
            success: (oDataResponse, oRequestResponse) => {
              resolve(oDataResponse.results || [], oRequestResponse);
            },
            error: (oErrorRepsonse) => {
              reject(oErrorRepsonse);
            },
          });
        });
      });
    };

    /////////////////////////////////////////////////////////////////////////
    // Start - Create Email OData Methods
    /////////////////////////////////////////////////////////////////////////

    // post case mail to get template in response
    CommonModelManager.createMail = (oData) => {
      return new Promise((resolve, reject) => {
        var oModel = CommonModelManager.getModel();
        oModel.metadataLoaded().then(() => {
          oModel.create("/SE_CASEMAILSet", oData, {
            success: (oDataResponse, oRequestResponse) => {
              resolve(oDataResponse, oRequestResponse);
            },
            error: (oErrorRepsonse) => {
              reject(oErrorRepsonse);
            },
          });
        });
      });
    };

    /////////////////////////////////////////////////////////////////////////
    // End - Create Email OData Methods
    /////////////////////////////////////////////////////////////////////////

    return CommonModelManager;
  }
);
