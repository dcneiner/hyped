require( "../setup" );
var model = require( "../model.js" );
var HyperResource = require( "../../src/hyperResource.js" );

var board1 = model.board1;
var limit = 5;

describe( "with static links", function() {
	var elapsedMs;
	var resource = {
		name: "board",
		actions: {
			self: {
				method: "get",
				url: "/board/:id",
				include: [ "id", "title" ],
				links: {
					favstarred: "/board/:id?favstarred=true",
					worstever: "/board/:id?h8=true",
					"next-page": function( data, context ) {
						return "/board/:id?page=" + ( context.page + 1 ) + "&size=" + context.size;
					},
					"prev-page": function( data, context ) {
						if ( context.page && context.page > 1 ) {
							return "/board/:id?page=" + ( context.page - 1 ) + "&size=" + context.size;
						}
					}
				}
			}
		}
	};

	var self1, self2;
	var expectedSelf1 = {
		id: 100,
		title: "Test Board",
		_origin: { href: "/board/100", method: "GET" },
		_resource: "board",
		_action: "self",
		_links: {
			self: { href: "/board/100", method: "GET" },
			favstarred: { href: "/board/100?favstarred=true", method: "GET" },
			worstever: { href: "/board/100?h8=true", method: "GET" },
			"next-page": { href: "/board/100?page=2&size=10", method: "GET" }
		}
	};

	var expectedSelf2 = {
		id: 100,
		title: "Test Board",
		_origin: { href: "/board/100", method: "GET" },
		_resource: "board",
		_action: "self",
		_links: {
			self: { href: "/board/100", method: "GET" },
			favstarred: { href: "/board/100?favstarred=true", method: "GET" },
			worstever: { href: "/board/100?h8=true", method: "GET" },
			"next-page": { href: "/board/100?page=3&size=10", method: "GET" },
			"prev-page": { href: "/board/100?page=1&size=10", method: "GET" }
		}
	};

	before( function() {
		var start = Date.now();
		var fn = HyperResource.renderFn( { board: resource } );
		self1 = fn( "board", "self", board1, "", { page: 1, size: 10 } );
		self2 = fn( "board", "self", board1, "", { page: 2, size: 10 } );
		elapsedMs = Date.now() - start;
	} );

	it( "should generate links correctly", function() {
		self1.should.eql( expectedSelf1 );
		self2.should.eql( expectedSelf2 );
	} );

	it( "should be \"quick\"", function() {
		elapsedMs.should.be.below( limit );
	} );
} );

describe( "with resource prefixes", function() {
	var elapsedMs;
	var resource = {
		name: "board",
		urlPrefix: "/prefix1",
		apiPrefix: "/prefix2",
		actions: {
			self: {
				method: "get",
				url: "/board/:id",
				include: [ "id", "title" ],
				links: {
					favstarred: "/board/:id?favstarred=true",
					worstever: "/board/:id?h8=true",
					"next-page": function( data, context ) {
						return "/board/:id?page=" + ( context.page + 1 ) + "&size=" + context.size;
					},
					"prev-page": function( data, context ) {
						if ( context.page && context.page > 1 ) {
							return "/board/:id?page=" + ( context.page - 1 ) + "&size=" + context.size;
						}
					}
				}
			}
		}
	};

	var self1, self2;
	var expectedSelf1 = {
		id: 100,
		title: "Test Board",
		_origin: { href: "/prefix1/prefix2/board/100", method: "GET" },
		_resource: "board",
		_action: "self",
		_links: {
			self: { href: "/prefix1/prefix2/board/100", method: "GET" },
			favstarred: { href: "/prefix1/prefix2/board/100?favstarred=true", method: "GET" },
			worstever: { href: "/prefix1/prefix2/board/100?h8=true", method: "GET" },
			"next-page": { href: "/prefix1/prefix2/board/100?page=2&size=10", method: "GET" }
		}
	};

	var expectedSelf2 = {
		id: 100,
		title: "Test Board",
		_origin: { href: "/prefix1/prefix2/board/100", method: "GET" },
		_resource: "board",
		_action: "self",
		_links: {
			self: { href: "/prefix1/prefix2/board/100", method: "GET" },
			favstarred: { href: "/prefix1/prefix2/board/100?favstarred=true", method: "GET" },
			worstever: { href: "/prefix1/prefix2/board/100?h8=true", method: "GET" },
			"next-page": { href: "/prefix1/prefix2/board/100?page=3&size=10", method: "GET" },
			"prev-page": { href: "/prefix1/prefix2/board/100?page=1&size=10", method: "GET" }
		}
	};

	before( function() {
		var fn = HyperResource.renderFn( { board: resource }, { urlPrefix: "/badUrl", apiPrefix: "/badUrl" } );
		var start = Date.now();
		self1 = fn( "board", "self", board1, "", { page: 1, size: 10 } );
		self2 = fn( "board", "self", board1, "", { page: 2, size: 10 } );
		elapsedMs = Date.now() - start;
	} );

	it( "should generate links correctly for page 1", function() {
		self1.should.eql( expectedSelf1 );
	} );

	it( "should generate links correctly for page 2", function() {
		self2.should.eql( expectedSelf2 );
	} );

	it( "should be \"quick\"", function() {
		elapsedMs.should.be.below( limit );
	} );
} );
