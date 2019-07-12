/* eslint-env jasmine, jquery */
/* global GOVUK */

describe('Cookie banner', function () {
  'use strict'

  var container

  beforeEach(function () {
    container = document.createElement('div')
    container.innerHTML =
      '<div id="global-cookie-message" class="gem-c-cookie-banner" data-module="cookie-banner">' +
        '<div class="gem-c-cookie-banner__wrapper govuk-width-container" data-cookie-banner-main="true">' +
          '<p class="gem-c-cookie-banner__message">GOV.UK uses cookies to make the site simpler.</p>' +
          '<div class="gem-c-cookie-banner__buttons">' +
            '<button class="gem-c-button govuk-button gem-c-button--secondary-quiet gem-c-button--inline" type="submit" data-module="track-click" data-accept-cookies="true" data-track-category="cookieBanner" data-track-action="Cookie banner accepted">Accept cookies</button>' +
            '<a class="gem-c-button govuk-button gem-c-button--secondary-quiet gem-c-button--inline" role="button" data-module="track-click" data-track-category="cookieBanner" data-track-action="Cookie banner settings clicked" href="/help/cookies">Cookie settings</a>' +
          '</div>' +
        '</div>' +
        '<div class="gem-c-cookie-banner__confirmation govuk-width-container" data-cookie-banner-confirmation="true" style="display: none;">' +
          '<p class="gem-c-cookie-banner__confirmation-message">' +
            'You have accepted all cookies' +
          '</p>' +
          '<button class="gem-c-cookie-banner__hide-button" data-hide-cookie-banner="true">Hide</button>' +
        '</div>' +
      '</div>'

    document.body.appendChild(container)
  })

  afterEach(function () {
    document.body.removeChild(container)
  })

  it('should show the cookie banner', function () {
    var element = document.querySelector('[data-module="cookie-banner"]')
    new GOVUK.Modules.CookieBanner().start($(element))

    var newCookieBanner = document.querySelector('.gem-c-cookie-banner')
    var cookieBannerMain = document.querySelector('.gem-c-cookie-banner__wrapper')
    var cookieBannerConfirmation = document.querySelector('.gem-c-cookie-banner__confirmation')

    expect(newCookieBanner).toBeVisible()
    expect(cookieBannerMain).toBeVisible()
    expect(cookieBannerConfirmation).not.toBeVisible()
  })

  it('sets a default consent cookie', function () {
    var element = document.querySelector('[data-module="cookie-banner"]')
    new GOVUK.Modules.CookieBanner().start($(element))

    expect(GOVUK.getCookie('seen_cookie_message')).toEqual(null)
    expect(GOVUK.getCookie('cookie_policy')).toEqual('"{\\"essential\\":true,\\"settings\\":true,\\"usage\\":true,\\"campaigns\\":true}"')
  })

  it('sets consent cookie when accepting cookies', function () {
    spyOn(GOVUK, 'setCookie').and.callThrough()

    var element = document.querySelector('[data-module="cookie-banner"]')
    new GOVUK.Modules.CookieBanner().start($(element))

    // Manually reset the consent cookie so we can check the accept button works as intended
    expect(GOVUK.getCookie('cookie_policy')).toEqual('"{\\"essential\\":true,\\"settings\\":true,\\"usage\\":true,\\"campaigns\\":true}"')
    GOVUK.cookie('cookie_policy', null)

    var acceptCookiesButton = document.querySelector('[data-accept-cookies]')
    acceptCookiesButton.click()

    expect(GOVUK.setCookie).toHaveBeenCalledWith('seen_cookie_message', 'true', { days: 365 })
    expect(GOVUK.getCookie('cookie_policy')).toEqual('"{\\"essential\\":true,\\"settings\\":true,\\"usage\\":true,\\"campaigns\\":true}"')
  })

  it('shows a confirmation message when cookies have been accepted', function () {
    var element = document.querySelector('[data-module="cookie-banner"]')
    new GOVUK.Modules.CookieBanner().start($(element))

    var acceptCookiesButton = document.querySelector('[data-accept-cookies]')
    var mainCookieBanner = document.querySelector('div[data-cookie-banner-main]')
    var confirmationMessage = document.querySelector('div[data-cookie-banner-confirmation]')

    expect(mainCookieBanner).toBeVisible()
    expect(confirmationMessage).not.toBeVisible()

    acceptCookiesButton.click()

    expect(mainCookieBanner).not.toBeVisible()
    expect(confirmationMessage).toBeVisible()
  })

  it('should hide when pressing the "hide" link', function () {
    spyOn(GOVUK, 'setCookie').and.callThrough()

    var element = document.querySelector('[data-module="cookie-banner"]')
    new GOVUK.Modules.CookieBanner().start($(element))

    var banner = document.querySelector('[data-module="cookie-banner"]')
    var link = document.querySelector('button[data-hide-cookie-banner="true"]')
    link.dispatchEvent(new window.Event('click'))

    expect(banner).toBeHidden()
    expect(GOVUK.setCookie).toHaveBeenCalledWith('seen_cookie_message', 'true', { days: 365 })
    expect(GOVUK.getCookie('seen_cookie_message')).toBeTruthy()
  })

  it('does not show the banner if user has acknowledged the banner previously and consent cookie is present', function () {
    GOVUK.setCookie('seen_cookie_message', 'true')
    GOVUK.setDefaultConsentCookie()

    var element = document.querySelector('[data-module="cookie-banner"]')
    new GOVUK.Modules.CookieBanner().start($(element))

    var newCookieBanner = document.querySelector('.gem-c-cookie-banner')

    expect(newCookieBanner).not.toBeVisible()
  })

  it('hides the cookie banner if a cross-origin messages says so', function () {
    var element = document.querySelector('[data-module="cookie-banner"]')
    var cookieBannerModule = new GOVUK.Modules.CookieBanner()
    cookieBannerModule.start($(element))

    var mockMessage = {
      data: JSON.stringify({ 'hideCookieBanner': 'true' }),
      origin: 'https://content-publisher.publishing.service.gov.uk'
    }

    cookieBannerModule.receiveMessage(mockMessage)

    var newCookieBanner = document.querySelector('.gem-c-cookie-banner')
    expect(newCookieBanner).not.toBeVisible()
  })
})
