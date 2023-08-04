/**
 * External dependencies.
 */
import {__} from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { GiveConfirmModal, GiveErrorAlert } from '../../plugins/modal';

window.addEventListener( 'DOMContentLoaded', function() {
	const donationStatus = document.getElementById( 'give-payment-status' ),
		  onBoardingButtons = document.querySelectorAll( 'button.js-give-paypal-on-boarding-handler' ),
		  disconnectPayPalAccountButtons = document.querySelectorAll( '.js-give-paypal-disconnect-paypal-account' ),
		  countryField = document.getElementById( 'paypal_commerce_account_country' ),
		  paypalModalObserver = new MutationObserver( function( mutationsRecord ) {
			  mutationsRecord.forEach( function( record ) {
			  	record.removedNodes.forEach( function( node ) {
					if ( 'PPMiniWin' === node.getAttribute( 'id' ) ) {
						const paypalErrorQuickHelp = document.getElementById( 'give-paypal-onboarding-trouble-notice' );
						paypalErrorQuickHelp && paypalErrorQuickHelp.classList.remove( 'give-hidden' );
					}
				} );
			  } );
		  } );

    // This object will check if a class added to body or not.
    // If class added that means modal opened.
    // If class removed that means modal closed.
    paypalModalObserver.observe( document.querySelector( 'body' ), { attributes: true, childList: true } );

	if ( donationStatus ) {
		donationStatus.addEventListener( 'change', ( event ) => {
			const paypalDonationsCheckbox = document.getElementById( 'give-paypal-commerce-opt-refund' );

			if ( null === paypalDonationsCheckbox ) {
				return;
			}

			paypalDonationsCheckbox.checked = false;

			// If donation status is complete, then show refund checkbox
			if ( 'refunded' === event.target.value ) {
				document.getElementById( 'give-paypal-commerce-opt-refund-wrap' ).style.display = 'block';
			} else {
				document.getElementById( 'give-paypal-commerce-opt-refund-wrap' ).style.display = 'none';
			}
		} );
	}

	if ( window.location.search.match( /paypal-commerce-account-connected=1/i ) ) {
		const pciWarnings = window.givePayPalCommerce.translations.pciComplianceInstructions
			.map( instruction => `<li>${ instruction }</li>` )
			.join( '' );

		// eslint-disable-next-line no-undef
		new Give.modal.GiveSuccessAlert( {
			classes: {
				modalWrapper: 'paypal-commerce-connect',
				cancelBtn: 'give-button--primary',
			},
			modalContent: {
				title: window.givePayPalCommerce.translations.connectSuccessTitle,
				body: `
					<div class="give-modal__description">
						<p>${ window.givePayPalCommerce.translations.pciWarning }</p>
						<ul>${ pciWarnings }</ul>
					</div>
				`.trim(),
				cancelBtnTitle: Give.fn.getGlobalVar( 'confirm' ),
			},
			closeOnBgClick: true
		} ).render();

		// Update URL in browser address without reloading the page.
		let newUrl = Give.fn.removeURLParameter( window.location.href, 'paypal-commerce-account-connected' );
		history.pushState( {}, '', newUrl );
	}

	if ( onBoardingButtons.length ) {
        onBoardingButtons.forEach( function( onBoardingButton ) {
            onBoardingButton.addEventListener( 'click', function( evt ) {
                evt.preventDefault();

                let connectionAccountType = null;
                const mode = onBoardingButton.getAttribute( 'data-mode' );
                const countryCode = countryField.value;
                const container = {
                    $el_container: onBoardingButton.closest( 'td.give-forminp' ),
                    removeErrors: () => {
                        const errorsContainer = container.$el_container
                            .querySelector( '.paypal-message-template' );

                        if ( errorsContainer ) {
                            errorsContainer.parentElement.remove();
                        }
                    }
                }
                const buttonState = {
                    enable: () => {
                        onBoardingButton.disabled = false;
                        evt.target.innerText = onBoardingButton.getAttribute( 'data-initial-label' );
                    },
                    disable: () => {
                        // Preserve initial label.
                        if ( ! onBoardingButton.hasAttribute( 'data-initial-label' ) ) {
                            onBoardingButton.setAttribute( 'data-initial-label', onBoardingButton.innerText );
                        }

                        onBoardingButton.disabled = true;
                        evt.target.innerText = Give.fn.getGlobalVar( 'loader_translation' ).processing;
                    },
                };
                const paypalErrorQuickHelp = document.getElementById( 'give-paypal-onboarding-trouble-notice' );

                container.removeErrors();
                buttonState.disable();

                // Hide PayPal quick help message.
                paypalErrorQuickHelp && paypalErrorQuickHelp.remove();

                // eslint-disable-next-line no-undef
                const modalBody  =  `
                    <div class="give-modal__description">
                        <p class="welcome-text">Select account type for connection</p>
                        <p>
                            <label for="paypal_donations_connection_account_type_ppcp">
                                <input type="radio"
                                    name="paypal_donations_connection_account_type"
                                    id="paypal_donations_connection_account_type_ppcp"
                                    value="PPCP">&nbsp;${ __( 'Advancded Card Processing', 'givewp') }
                            </label>
                            <ul>
                                <li>${__( 'Accept Credit & Debit Cards', 'givewp')}</li>
                                <li>${__( 'Seller Protection', 'givewp')}</li>
                            </ul>
                        </p>
                        <p>
                            <label for="paypal_donations_connection_account_type_express_checkout">
                                <input type="radio"
                                    name="paypal_donations_connection_account_type"
                                    id="paypal_donations_connection_account_type_express_checkout"
                                    value="EXPRESS_CHECKOUT">&nbsp;${__( 'Standard Card Processing', 'give')}
                                <span>${__( 'Requires Application Approval', 'give')}</span>
                            </label>
                            <ul class="flex2x2">
                                <li>${__( 'Accept Credit & Debit Cards', 'give')}</li>
                                <li>${__( 'Seller Protection', 'give')}</li>
                                <li>${__( 'Fraud Protection', 'give')}</li>
                                <li>${__( 'Chargeback Protection', 'give')}</li>
                            </ul>
                        </p>
                        <div class="give-field-description">
                            <a href="https://docs.givewp.com/connection-comparison" target="_blank">
                                ${__('Read more about the connection types', 'give')}
                            </a>
                        </div>
                    </div>
                `.trim();

                const modal = new Give.modal.GiveConfirmModal({
                        classes: {
                            modalWrapper: 'paypal-commerce-connection-account-type-selection-modal',
                        },
                        modalContent: {
                            title: __( 'PayPal Connection', 'givewp' ),
                            body: modalBody,
                        },
                        closeOnBgClick: true,
                        callbacks: {
                            close: () => {
                                // Reset connection account type.
                                connectionAccountType = null;

                                container.removeErrors();
                                buttonState.enable();

                                // Hide PayPal quick help message.
                                paypalErrorQuickHelp && paypalErrorQuickHelp.remove();
                            }
                        },
                        successConfirm: () => {
                            const radioField = document.querySelector('input[name="paypal_donations_connection_account_type"]:checked');
                            radioField && ( connectionAccountType = radioField.value );

                            // Exit if admin available for both conneciton account types but did not select any.
                            if(
                                givePayPalCommerce.countriesAvailableForAdvanceConnection.includes( countryCode )
                                && ! givePayPalCommerce.accountTypes.includes( connectionAccountType )
                            ){
                                return;
                            }

                            // Request partner obboarding link.
                            fetch( ajaxurl + `?action=give_paypal_commerce_get_partner_url&countryCode=${countryCode}&mode=${mode}&accountType=${connectionAccountType}` )
                                .then( response => response.json() )
                                .then( function( res ) {
                                    if ( true === res.success ) {
                                        const payPalLink = document.querySelector( '[data-paypal-button]' );

                                        // Dynamically set callback function name.
                                        payPalLink.setAttribute(
                                            'data-paypal-onboard-complete',
                                            'live' === mode
                                                ? 'giveLivePayPalOnBoardedCallback'
                                                : 'giveSandboxPayPalOnBoardedCallback'
                                        );

                                        // Set PayPal button link (Partener link).
                                        payPalLink.href = `${ res.data.partnerLink }&displayMode=minibrowser`;

                                        payPalLink.click();
                                    }

                                    buttonState.enable();
                                } )
                                // Request troubleshooting help message.
                                .then( function() {
                                    fetch( ajaxurl + '?action=give_paypal_commerce_onboarding_trouble_notice' )
                                        .then( response => response.json() )
                                        .then( function( res ) {
                                            if ( true === res.success ) {
                                                function createElementFromHTML( htmlString ) {
                                                    const div = document.createElement( 'div' );
                                                    div.innerHTML = htmlString.trim();
                                                    return div.firstChild;
                                                }

                                                const buttonContainer = container.$el_container.querySelector( '.connect-button-wrap' );
                                                buttonContainer.append( createElementFromHTML( res.data ) );
                                            }
                                        } );
                                } );
                        }
                });

                // Ask for connection account type if admin select acountry which is available for PPCP and Express Checkout account.
                // Request parther link otherwise which will fetch onboarding link for Express Checkout account type.
                if( givePayPalCommerce.countriesAvailableForAdvanceConnection.includes( countryCode ) ) {
                    modal.render();
                } else{
                    modal.config.successConfirm();
                }

                return false;
            } );
        })
    }

    if (disconnectPayPalAccountButtons.length) {
        disconnectPayPalAccountButtons.forEach(function (disconnectPayPalAccountButton) {
            disconnectPayPalAccountButton.addEventListener('click', function (evt) {
                evt.preventDefault();

                const button = evt.target;
                const ButtonContainerEl = button.closest('div.connect-button-wrap');
                const connectionSettingEl = ButtonContainerEl.querySelector('div.connection-setting');
                const disConnectionSettingEl = ButtonContainerEl.querySelector('div.disconnection-setting');
                let isConfirmed = false;
                const disconnectPayPalAccountFn = () => {
                    const formData = new FormData();
                    const requestData = {};

                    // Do nothing if user cancel the confirmation.
                    if (!isConfirmed) {
                        return;
                    }

                    formData.append('action', 'give_paypal_commerce_disconnect_account');
                    formData.append('mode', button.getAttribute('data-mode'));

                    requestData.method = 'POST';
                    requestData.body = formData;

                    // Send request to disconnect PayPal account.
                    fetch(ajaxurl, requestData)
                        .then(response => response.json())
                        .then(function (response) {
                            if (!response.success) {
                                // Show error message.
                                new GiveErrorAlert({
                                    modalContent: {
                                        desc: response.data.error,
                                    }
                                }).render();

                                return;
                            }

                            connectionSettingEl.classList.remove('give-hidden');
                            disConnectionSettingEl.classList.add('give-hidden');
                        });

                };

                // Show confirmation modal.
                new GiveConfirmModal({
                    modalContent: {
                        title: givePayPalCommerce.translations.confirmPaypalAccountDisconnection,
                        desc: givePayPalCommerce.translations.disconnectPayPalAccount,
                    },
                    successConfirm: () => isConfirmed = true,
                    callbacks: {
                        afterClose: () => disconnectPayPalAccountFn()
                    }
                }).render()

                return false;
            });
        });
    }
} );
