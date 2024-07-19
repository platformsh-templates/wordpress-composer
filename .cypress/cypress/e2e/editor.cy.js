const newPost = {
  "title": "New post from E2E",
  "body": "this is a new post created from e2e testing"
}
describe("Editor can log in and post", ()=>{
	before(()=>{
    cy.createUser(Cypress.env('test_user'))
  })

  it("can navigate to log in page", ()=>{
		cy.visit("/login")
		cy.url().should('match',/\//).should('include','wp-login.php')
	})


	it('Can login via custom function', ()=>{
    cy.wplogin(Cypress.env('test_user'),Cypress.env('test_user_pass'));
		cy.visit('/wp-admin/')
		cy.get('#wp-admin-bar-my-account').contains(Cypress.env('test_user')).should('exist')
	})

	// it('can navigate to the posts page', ()=>{
	// 	cy.get('#menu-posts').invoke('show')
	//
	// })

	it('Can navigate to new posts page',()=>{
		cy.wplogin(Cypress.env('test_user'),Cypress.env('test_user_pass'));
		cy.visit('/wp-admin/post-new.php')
		cy.get('#editor').should('exist')

	})

	it('Can add and view a new post ', ()=> {
		cy.wplogin(Cypress.env('test_user'),Cypress.env('test_user_pass'))
		cy.visit('/wp-admin/post-new.php')
		cy.get('button[aria-label="Options"]').click()
		cy.get('div[class="components-menu-group"]').find('button').contains('Code editor').click()
		cy.get('#inspector-textarea-control-0').type(newPost.title)
    cy.get('#post-content-0').type(newPost.body)

		//yes, this is brittle but there aren't any id's and very few other identifiers to target these elements
		//cy.get('div[class="edit-post-text-editor__toolbar"]').find('button').contains('Exit code editor').click()
    cy.get('div[class="editor-text-editor__toolbar"]').find('button').contains('Exit code editor').click()
		cy.get('#editor').find('button').contains('Publish').click()
		//now we have ANOTHER panel that displays and asks us to click ANOTHER publish button
		cy.get('div[class="editor-post-publish-panel"]').as('publishpanel')

		cy.get('@publishpanel').find('button').contains('Publish').click()

		//now we need to verify it has published
		cy.get('@publishpanel').find('a').contains('View Post').as('viewpost').should('exist')
    cy.get('@viewpost').click()
    cy.get('body')
      .find('h1').contains(newPost.title).should('exist')

		//cy.get('[aria-label="Add title"]').click().type('Hello!')
	})

  it('can delete their own posts', ()=>{
    // Auth and get session
    cy.wplogin(Cypress.env('test_user'),Cypress.env('test_user_pass'))
    // Programmatically add a post so we can delete it
    cy.addPostForUser(Cypress.env('test_user'),newPost)
    cy.visit('/wp-admin/edit.php')
    // our post should be here
    cy.get('#the-list').find('[data-colname="Title"]').contains(`${newPost.title} test`).should('exist')
    // now click it
    cy.get('#the-list').find('[data-colname="Title"]').contains(`${newPost.title} test`).as('ourCell')
    cy.get('@ourCell')
      .find('span[class="trash"]').contains('Trash')
      .find('a[class="submitdelete"]').click()
    cy.get('#message').should('contain','1 post moved to the Trash')
    // //cy.closeWelcomeModal()
    // //cy.get('.editor-post-trash').click()
    // //3 ... menu
    // cy.get('button[aria-label="Actions"]').click()
    // //Move to trash "button"
    // cy.get('#:r23:').should('contain','Move to Trash').click()
    // cy.get('.components-flex > .is-primary').should('contain','Trash').click()

  })
})
