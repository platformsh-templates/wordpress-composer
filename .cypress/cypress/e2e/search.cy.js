describe("Search", ()=>{
	beforeEach(()=>{
		cy.request({url: '/foobar', failOnStatusCode: false}).its('status').should('equal', 404)
		cy.visit('/foobar', {failOnStatusCode: false})
	})
	context("Search tests", () => {
		it("Visits a random page",()=>{
			cy.request({url: '/foobar', failOnStatusCode: false}).its('status').should('equal', 404)
			cy.visit('/foobar', {failOnStatusCode: false})
			cy.get('#page-not-found').should("exist").contains("Page Not Found")
		})

		it("Runs search from 404", ()=>{
			cy.get("#wp-block-search__input-2").type("Sample")
			cy.get('[aria-label="Search"]').click()
			cy.location().should((loc)=>{
				expect(loc.pathname).to.equal('/')
				expect(loc.search).to.equal('?s=Sample')
			})

			cy.get('main').as('main')
			cy.get('@main').find('h1').contains('Search results').should('exist')
			cy.get('@main').find('li').contains('Sample Page').should('exist')


		})
	})
})
