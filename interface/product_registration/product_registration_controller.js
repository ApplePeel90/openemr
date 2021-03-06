/**
 * ProductRegistrationController (JavaScript)
 *
 * LICENSE: This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://opensource.org/licenses/gpl-license.php>;.
 *
 * @package OpenEMR
 * @author  Matthew Vita <matthewvita48@gmail.com>
 * @link    http://www.open-emr.org
 */

"use strict";

function ProductRegistrationController() {
    var self = this;

    var _productRegistrationService = new ProductRegistrationService();

    self.getProductRegistrationStatus = function (callback) {
        _productRegistrationService.getProductStatus(function (err, data) {
            if (err) {
                return callback(err, null);
            }

            callback(null, data);
        });
    };

    self.showProductRegistrationModal = function () {
        _displayFormView();
    };

    var _displayFormView = function () {
        // Workaround to get i18n keys
        var buttonObject = {};
        buttonObject[registrationTranslations.submit] = _formSubmissionHandler;
        buttonObject[registrationTranslations.noThanks] = _formCancellationHandler;
    
        $('.product-registration-modal .modal-header').text(registrationTranslations.title);

        $('.product-registration-modal .submit').on('click', function(e){
                _formSubmissionHandler();
                return false;
            });
    
        $('.product-registration-modal .nothanks').on('click', function(e){
            _formCancellationHandler();
            return false;
        });

        $('.product-registration-modal').modal('toggle');
            
        
        

        // Wire up "enter key" handler in case user doesn't click the modal buttons manually
        $('.product-registration-modal .email').on('keypress', function (event) {
            if (event.which == 13) {
                _formSubmissionHandler();
                return false;
            }
        });
    };

    var _formSubmissionHandler = function () {
        var email = $('.product-registration-modal .email').val() || '';

        if (email === '' || email.indexOf('@') < 0) {
            $('.product-registration-modal .message').text(registrationTranslations.pleaseProvideValidEmail);
        } else {
            $('.product-registration-modal .message').text('');

            _productRegistrationService.submitRegistration(email, function (err, data) {
                if (err) {
                    return _registrationFailedHandler(err);
                }

                _registrationCreatedHandler(data);
            });
        }
    };

    // If we are on the about_page, show the registration data.
    self.displayRegistrationInformationIfDivExists = function (data) {
        if ($('.product-registration').length > 0) {
            $('.product-registration .email').text(registrationTranslations.registeredEmail + ' ' + data.email);
            $('.product-registration .id').text(registrationTranslations.registeredId + ' ' + data.registrationId);
        }
    };

    var _formCancellationHandler = function () {
        _closeModal();

        // Note: not checking output here (don't want to bug the user more this session
        // after they said "no thanks" to the modal). If anything goes wrong, it will be silent.
        // The only reasons why this would fail would be because of no connection or our server
        // is down.
        var _noop = function () {};
        _productRegistrationService.submitRegistration(false, _noop);
    };

     var _registrationCreatedHandler = function (data) {
        $('.product-registration-modal .context').remove();
        $('.product-registration-modal .email').remove();
        $('.product-registration-modal .message').text(registrationTranslations.registeredSuccess);
        _closeModal(2500);
        self.displayRegistrationInformationIfDivExists(data);
    };

    var _registrationFailedHandler = function (error) {
        $('.product-registration-modal .message').text(error);
    };

    var _closeModal = function (closeWaitTimeMilliseconds) {
        setTimeout(function () {
            $('.product-registration-modal').modal('toggle');
        }, closeWaitTimeMilliseconds || 0);
    };
}
