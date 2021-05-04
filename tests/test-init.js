const utils = require('./test-utils');
const chai = require('chai');
chai.use(require('chai-http'));
const request = chai.request(utils.BACKEND_URL);

module.exports = {
    /**
     *
     * @param { ObjectConstructor } user
     * @param { string } page
     * @description Registers a new user.
     * @returns { void }
     */
    registerUser: async function(user, page) {
        if (
            utils.BACKEND_URL.includes('localhost') ||
            utils.BACKEND_URL.includes('staging.fyipe.com')
        ) {
            const { email } = user;
            let frame, elementHandle;
            await page.goto(utils.ACCOUNTS_URL + '/register', {
                waitUntil: 'networkidle2',
            });
            await page.waitForSelector('#email');
            await page.click('input[name=email]');
            await page.type('input[name=email]', email);
            await page.click('input[name=name]');
            await page.type('input[name=name]', 'Test Name');
            await page.click('input[name=companyName]');
            await page.type('input[name=companyName]', 'Test Name');
            await page.click('input[name=companyPhoneNumber]');
            await page.type('input[name=companyPhoneNumber]', '99105688');
            await page.click('input[name=password]');
            await page.type('input[name=password]', '1234567890');
            await page.click('input[name=confirmPassword]');
            await page.type('input[name=confirmPassword]', '1234567890');

            await page.click('button[type=submit]');
            await page.waitForSelector(`form#card-form`, {
                visible: true,
            });

            await page.waitForSelector('.__PrivateStripeElement > iframe', {
                visible: true,
            });
            const stripeIframeElements = await page.$$(
                '.__PrivateStripeElement > iframe'
            );

            await page.click('input[name=cardName]');
            await page.type('input[name=cardName]', 'Test name');

            elementHandle = stripeIframeElements[0]; // card element
            frame = await elementHandle.contentFrame();
            await frame.waitForSelector('input[name=cardnumber]');
            await frame.type('input[name=cardnumber]', '42424242424242424242', {
                delay: 50,
            });

            elementHandle = stripeIframeElements[1]; // cvc element
            frame = await elementHandle.contentFrame();
            await frame.waitForSelector('input[name=cvc]');
            await frame.type('input[name=cvc]', '123', {
                delay: 50,
            });

            elementHandle = stripeIframeElements[2]; // exp element
            frame = await elementHandle.contentFrame();
            await frame.waitForSelector('input[name=exp-date]');
            await frame.type('input[name=exp-date]', '11/23', {
                delay: 50,
            });
            await page.click('input[name=address1]');
            await page.type('input[name=address1]', utils.user.address.streetA);
            await page.click('input[name=address2]');
            await page.type('input[name=address2]', utils.user.address.streetB);
            await page.click('input[name=city]');
            await page.type('input[name=city]', utils.user.address.city);
            await page.click('input[name=state]');
            await page.type('input[name=state]', utils.user.address.state);
            await page.click('input[name=zipCode]');
            await page.type('input[name=zipCode]', utils.user.address.zipcode);
            await page.select('#country', 'India');
            await page.click('button[type=submit]');

            const signupResponse = await page.waitForResponse(
                response =>
                    response.url().includes('/user/signup') &&
                    response.status() === 200
            );
            if (signupResponse._status !== 200) {
                throw new Error('Sign up did not return 200');
            }
        }
    },
    loginUser: async function(user, page) {
        const { email, password } =
            utils.BACKEND_URL.includes('localhost') ||
            utils.BACKEND_URL.includes('staging')
                ? user
                : {
                      email: 'user@fyipe.com',
                      password: 'mVzkm{LAP)mNC8t23ehqifb2p',
                  };
        await page.goto(utils.ACCOUNTS_URL + '/login', {
            waitUntil: 'networkidle2',
        });
        await page.waitForSelector('#login-button');
        await page.click('input[name=email]');
        await page.type('input[name=email]', email);
        await page.click('input[name=password]');
        await page.type('input[name=password]', password);
        await page.click('button[type=submit]');

        await page.waitForSelector('#home', { visible: true, timeout: 100000 });
    },
    loginEnterpriseUser: async function(user, page) {
        const { email, password } = user;
        await page.goto(utils.ACCOUNTS_URL + '/login', {
            waitUntil: 'networkidle2',
        });
        await page.waitForSelector('#login-button');
        await page.click('input[name=email]');
        await page.type('input[name=email]', email);
        await page.click('input[name=password]');
        await page.type('input[name=password]', password);
        await page.click('button[type=submit]');

        await page.waitForSelector('#users', {
            visible: true,
            timeout: 100000,
        });
    },
    registerEnterpriseUser: async function(user, page) {
        const masterAdmin = {
            email: 'masteradmin@hackerbay.io',
            password: '1234567890',
        };
        await page.goto(utils.ACCOUNTS_URL + '/login', {
            waitUntil: 'networkidle2',
        });
        const signUp = await page.$('#signUpLink');
        if (signUp) {
            await page.goto(utils.ACCOUNTS_URL + '/register', {
                waitUntil: 'networkidle2',
            });
            await page.waitForSelector('#email');
            await page.click('input[name=email]');
            await page.type('input[name=email]', masterAdmin.email);
            await page.click('input[name=name]');
            await page.type('input[name=name]', 'Master Admin');
            await page.click('input[name=companyName]');
            await page.type('input[name=companyName]', 'Master');
            await page.click('input[name=companyPhoneNumber]');
            await page.type('input[name=companyPhoneNumber]', '99105688');
            await page.click('input[name=password]');
            await page.type('input[name=password]', '1234567890');
            await page.click('input[name=confirmPassword]');
            await page.type('input[name=confirmPassword]', '1234567890');
            await Promise.all([
                page.click('button[type=submit]'),
                page.waitForSelector('#users', {
                    visible: true,
                    timeout: 100000,
                }),
            ]);
        } else {
            await this.loginEnterpriseUser(masterAdmin, page);
        }
        // create the user from admin dashboard
        const { email } = user;
        await page.waitForSelector('#add_user');
        await page.click('#add_user');
        await page.waitForSelector('#email');
        await page.click('input[name=email]');
        await page.type('input[name=email]', email);
        await page.click('input[name=name]');
        await page.type('input[name=name]', 'Test Name');
        await page.click('input[name=companyName]');
        await page.type('input[name=companyName]', 'Test Name');
        await page.click('input[name=companyPhoneNumber]');
        await page.type('input[name=companyPhoneNumber]', '99105688');
        await page.click('input[name=password]');
        await page.type('input[name=password]', '1234567890');
        await page.click('input[name=confirmPassword]');
        await page.type('input[name=confirmPassword]', '1234567890');
        await page.click('button[type=submit]');
        try {
            const signupResponse = await page.waitForResponse(
                response =>
                    response.url().includes('/user/signup') &&
                    response.status() === 200
            );
            if (signupResponse) {
                const signupData = await signupResponse.text();
                const parsedSignupData = JSON.parse(signupData);
                if (parsedSignupData.verificationToken) {
                    await request
                        .get(
                            `/user/confirmation/${parsedSignupData.verificationToken}`
                        )
                        .redirects(0);
                }
            }
        } catch (error) {
            //catch
        }
    },
    logout: async function(page) {
        await page.goto(utils.ADMIN_DASHBOARD_URL);
        await page.waitForSelector('button#profile-menu', { visible: true });
        await page.click('button#profile-menu');
        await page.waitForSelector('button#logout-button');
        await page.click('button#logout-button');
        await page.reload();
        await page.waitForTimeout(3000);
    },
    saasLogout: async function(page) {
        await page.goto(utils.DASHBOARD_URL);
        await page.waitForSelector('button#profile-menu', { visible: true });
        await page.click('button#profile-menu');
        await page.waitForSelector('button#logout-button');
        await page.click('button#logout-button');
        await page.reload({ waitUntil: 'networkidle0' });
    },
    selectByText: async function(selector, text, page) {
        await page.click(selector, { delay: 100 });
        await page.keyboard.type(text);
        const noOption = await page.$('div.css-1gl4k7y');
        if (!noOption) {
            await page.keyboard.type(String.fromCharCode(13));
        }
    },
    clear: async function(selector, page) {
        const input = await page.$(selector);
        await input.click({ clickCount: 3 });
        await input.type('');
    },
    renameProject: async function(newProjectName, page) {
        await page.waitForSelector('#projectSettings');
        await page.click('#projectSettings');
        await page.waitForSelector('input[name=project_name]');
        await this.clear('input[name=project_name]', page);
        await page.type('input[name=project_name]', newProjectName);
        await page.click('#btnCreateProject');
    },
    addComponent: async function(componentName, page) {
        await page.waitForSelector('#form-new-component', { visible: true });
        await page.waitForSelector('input[id=name]', { visible: true });
        await page.click('input[id=name]');
        await page.type('input[id=name]', componentName);
        await page.click('button[type=submit]');
        await page.waitForSelector(`#cb${componentName}`, { visible: true });
    },
    addMonitor: async function(monitorName, description, page) {
        await page.waitForSelector('#form-new-monitor', { visible: true });
        await page.waitForSelector('input[id=name]', { visible: true });
        await page.click('input[id=name]');
        await page.type('input[id=name]', monitorName);
        await page.click('[data-testId=type_manual]');
        await page.waitForSelector('#description', { visible: true });
        await page.click('#description');
        await page.type('#description', description);
        await page.click('button[type=submit]');
        await page.waitForSelector(`#cb${monitorName}`, { visible: true });
    },
    navigateToComponentDetails: async function(component, page) {
        // Navigate to Components page
        await page.goto(utils.DASHBOARD_URL, { waitUntil: 'networkidle0' });
        await page.waitForSelector('#components', { visible: true });
        await page.click('#components');

        // Navigate to details page of component assumed created
        await page.waitForSelector(`#more-details-${component}`);
        await page.$eval(`#more-details-${component}`, e => e.click());
    },
    addMonitorToStatusPage: async function(componentName, monitorName, page) {
        await page.goto(utils.DASHBOARD_URL, {
            waitUntil: 'networkidle2',
        });
        const description = utils.generateRandomString();
        await page.waitForSelector('#statusPages');
        await page.click('#statusPages');
        await page.waitForSelector('#statusPagesListContainer');
        await page.waitForSelector('#viewStatusPage');
        await page.click('#viewStatusPage');
        await page.waitForSelector('#addMoreMonitors');
        await page.click('#addMoreMonitors');
        await this.selectByText(
            'ul > li:last-of-type #monitor-name',
            `${componentName} / ${monitorName}`,
            page
        );
        await page.click('ul > li:last-of-type #monitor-description');
        await page.type(
            'ul > li:last-of-type #monitor-description',
            description
        );
        await page.click('ul > li:last-of-type #manual-monitor-checkbox');
        await page.click('#btnAddStatusPageMonitors');
    },
    clickStatusPageUrl: async function(page) {
        await page.waitForSelector('#publicStatusPageUrl');
        let link = await page.$('#publicStatusPageUrl > span > a');
        link = await link.getProperty('href');
        link = await link.jsonValue();
        await page.goto(link);
    },
    navigateToStatusPage: async function(page) {
        await page.waitForSelector('#statusPages');
        await page.click('#statusPages');
        await page.waitForSelector('#statusPagesListContainer');
        await page.waitForSelector('#viewStatusPage');
        await page.click('#viewStatusPage');
        await this.clickStatusPageUrl(page);
    },
    navigateToMonitorDetails: async function(monitorName, page) {
        await page.waitForSelector('#components');
        await page.click('#components');
        await page.waitForSelector(`#view-resource-${monitorName}`);
        await page.click(`#view-resource-${monitorName}`);
        await page.waitForSelector(`#monitor-title-${monitorName}`);
    },
    growthPlanUpgrade: async function(page) {
        await page.goto(utils.DASHBOARD_URL);
        await page.waitForSelector('#projectSettings', { visible: true });
        await page.click('#projectSettings');
        await page.waitForSelector('#billing');
        await page.click('#billing');
        await page.waitForSelector('input#Growth_month', {
            visible: true,
        });
        await page.click('input#Growth_month');
        await page.click('#changePlanBtn');
        await page.waitForSelector('.ball-beat', { hidden: true });
    },
    gotoTab: async function(tabId, page) {
        await page.waitForSelector(`#react-tabs-${tabId}`, { visible: true });
        await page.$eval(`#react-tabs-${tabId}`, e => e.click());
    },
    themeNavigationAndConfirmation: async function(page, theme){
        await this.gotoTab(6,page);    
        await page.waitForSelector(`#${theme}`, {visible: true});
        await page.click(`#${theme}`);
        await page.waitForSelector('#changePlanBtn', {visible: true});
        await page.click('#changePlanBtn');    
        await this.gotoTab(0,page);
    }
};