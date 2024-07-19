describe("Search", ()=>{
	beforeEach(()=>{
		cy.request({url: '/foobar', failOnStatusCode: false}).its('status').should('equal', 404)
		cy.visit('/foobar', {failOnStatusCode: false})
	})
	context("Search tests", () => {
		it("Visits a random page",()=>{
			cy.request({url: '/foobar', failOnStatusCode: false}).its('status').should('equal', 404)
			cy.visit('/foobar', {failOnStatusCode: false})
			cy.get('#page-not-found').should("exist").contains("Nothing here")
		})

		it("Runs search from 404", ()=>{
			cy.get("#search-form-1").type("Sample{enter}")
			cy.get('[aria-label="Search"]').click()
			cy.location().should((loc)=>{
				expect(loc.pathname).to.equal('/')
				expect(loc.search).to.equal('?s=Sample')
			})

			cy.get('main').as('main')
			cy.get('@main').find('h1').contains('Results for').should('exist')
			cy.get('@main').find('h2').contains('Sample Page').should('exist')


		})
	})
})
