// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
/**
 * Authenticates a user programmatically
 */
Cypress.Commands.add('wplogin',(username,password)=>{

  Cypress.log({
		name: 'wplogin',
		message: `${username}`,
	})

	cy.session(username, ()=>{
    cy.request({
      	method: 'POST',
      	url: 'wp-login.php',
      	form: true,
      	body: {
      		log: username,
      		pwd: password,
      		redirect_to: '',
      		rememberme: '',
      		testcookie: 1,
      		'wp-submit': 'Log In',
      	}
      })
	})
})

/**
 * Resets state for our test user
 * If a user exists:
 * - Removes any stored session data for the user
 * - Deletes the user's posts
 * - Deletes the user
 */
Cypress.Commands.add('beforeCreateUser', (username) => {
  const cmdPrefix = determineOurCmdPrefix()
  console.log('starting function beforeCreateUser')
  //const cmdUserFind = `${cmdPrefix} wp user list --login="${username}" --field=ID`
  console.log('Calling function findUser ')
  cy.findUser(username).then((data)=>{
    if(data.id !== '') {
      console.log(`user ${username} exists and has an ID of ${data.id}`)
      //delete their posts before we delete them
      console.log('calling function findUserPosts ')
      cy.findUserPosts(data.id).then((posts)=>{
        if(posts.length > 0) {
          console.log(`we have posts to delete for user ${data.id}. List of posts to delete:`)
          console.log(posts)
          const deletePosts = posts.join(' ')
          const cmdDeletePosts = `${cmdPrefix} 'wp post delete ${deletePosts}'`
          cy.exec(cmdDeletePosts).its('code').should('eq',0)
        }
      })
      Cypress.session.clearAllSavedSessions()
      const cmdUserDelete = `${cmdPrefix} 'wp user delete ${data.id} --yes'`
      cy.exec(cmdUserDelete).its('code').should('eq',0)
    }
  })

  // cy.exec(cmdUserFind).then((response)=>{
  //   if(response.stdout !== '') {
  //     console.log(`user ${username} exists and has an ID of ${response.stdout}`)
  //     Cypress.session.clearAllSavedSessions()
  //     const cmdUserDelete = `${cmdPrefix} wp user delete ${response.stdout} --reassign=false`
  //     cy.exec(cmdUserDelete).its('code').should('eq',0)
  //   }
  // })
})

/**
 * Creates a new test user account in our WordPress instance
 */
Cypress.Commands.add('createUser', (username, role="editor") => {
  cy.beforeCreateUser(username)
  const vendor = Cypress.env('environment')
  const cmdPrefix = determineOurCmdPrefix()

  const cmdUserCreate = `${cmdPrefix} 'wp user create ${username} ${username}@mail.com --role=${role} --send-email=false --quiet'`

  cy.exec(cmdUserCreate).should((response) => {
    expect(response.code).to.equal(0)
    expect(response.stdout).to.contain('Password:')
  }).then(($response)=>{
    //console.log('evaluating what the returned password is: ')
    //console.log(`stdout is : ${$response.stdout}`)
    const pswrd = $response.stdout.match(/^Password: (.*)$/)
    //console.log('Setting the new password.')
    Cypress.env('test_user_pass',pswrd[1])
    cy.findUser(username).then((userdata)=>{
      cy.setWelcomePref(userdata.id)
    })
  })
})

/**
 * Retrieves a user id based on their username
 */
Cypress.Commands.add('findUser', (username) => {
  console.log('starting function findUser')
  const vendor = Cypress.env('environment')
  const cmdPrefix = determineOurCmdPrefix()

  const cmdUserFind = `${cmdPrefix} 'wp user list --login="${username}" --field=ID'`
  cy.exec(cmdUserFind).then((response)=>{
    const returnData = {id:''}
    if(response.stdout !== ''){
      returnData.id = response.stdout
    }
    console.log('Leaving function findUser')
    return returnData
  })
})

/**
 * Finds the list of posts for a given userID
 */
Cypress.Commands.add('findUserPosts', (userID) => {
  const cmdPrefix = determineOurCmdPrefix()
  let posts = []
  console.log('starting function findUserPosts')
  const cmdFindUserPosts = `${cmdPrefix} 'wp post list --field=ID --post_author=${userID} --format=json'`
  cy.exec(cmdFindUserPosts).then((response)=>{
    /**
     * we should get a string in JSON format. if no posts were found we should get []
     */
    const possiblePosts = JSON.parse(response.stdout)
    if(possiblePosts.length > 0) {
      posts = possiblePosts
    }

    return posts
  })
})

/**
 * Creates a post for a user
 * Used for testing if a user can delete their own posts
 */
Cypress.Commands.add('addPostForUser',(username, postObject)=>{
  const cmdPrefix = determineOurCmdPrefix()
  console.log(`Adding a post for user ${username}`)
  cy.findUser(username).then((user)=>{
    expect(user.id).to.not.equal('')
    const cmdNewPost = `${cmdPrefix} 'wp post create --post_title="${postObject.title} test" --post_content="${postObject.body}" --post_author=${user.id} --post_status=publish'`
    cy.exec(cmdNewPost).its('code').should('eq',0)
  })
})

// Cypress.Commands.add('closeWelcomeModal',()=>{
//   cy.get('.components-modal__header > .components-button').should('exist').then((button)=> {
//     cy.wrap(button).click()
//   })
// })

/**
 * Sets the user pref to not display the welcome message in the post editor screen
 */
Cypress.Commands.add('setWelcomePref',(userid)=>{
  const cmdPrefix = determineOurCmdPrefix()
  const userMetaPrefsKey = 'wp_persisted_preferences'
  const cmdGetPrefs = `${cmdPrefix} 'wp user meta get ${userid} ${userMetaPrefsKey} --format=json'`
  console.log(`Getting user prefs for use ${userid}`)
  cy.exec(cmdGetPrefs,{failOnNonZeroExit: false}).then((response)=>{
    //expect(response.code).to.eq(0)
    let prefs = {}
    if ('' != response.stdout) {
      prefs = JSON.parse(response.stdout)
    }

    if(!Object.hasOwn(prefs,'core/edit-post')) {
      console.log('prefs does not have core-edit-property. setting.')
      //Object.defineProperty(prefs, 'core/edit-post',{})
      prefs['core/edit-post'] = {}
    }

    if(!Object.hasOwn(prefs['core/edit-post'],'welcomeGuide')) {
      console.log('prefs.core-edit-post does not have property welcomeGuide. Setting to false')
      //Object.defineProperty(prefs['core/edit-post'],'welcomeGuide',false)
      prefs['core/edit-post'].welcomeGuide = false
    } else {
      console.log('prefs.core-edit-post.welcomeGuide exists! Setting to false')
      prefs['core/edit-post'].welcomeGuide = false
    }

    const prefsToSave = JSON.stringify(prefs)
    const cmdSavePrefs = `PREFS='${prefsToSave}' && ${cmdPrefix} "wp user meta update ${userid} ${userMetaPrefsKey} '$PREFS' --format=json"`
    console.log(`Saving user prefs for user ${userid}`)
    cy.exec(cmdSavePrefs).its('code').should('eq',0)
  })
})

const determineOurCmdPrefix = () => {
  const vendor = Cypress.env('environment')
  let cmdPrefix = '';
  switch (vendor) {
    case 'ddev':
    case 'local':
      cmdPrefix = 'ddev exec'
      break;
    default:
      cmdPrefix = `${vendor} ssh`
  }

  return cmdPrefix
}


