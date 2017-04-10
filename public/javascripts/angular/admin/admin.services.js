(function (){
	angular
		.module ('admin')
		.factory ('PaginationService', paginationService);

	function paginationService () {
		return {
			getPage: function (totalItems, pageItems, currentPage) {
				// var totalItems = data.length;

				pageItems = pageItems || 5;
				currentPage = currentPage || 1;

				var totalPages = Math.ceil (totalItems/pageItems);

				var startIndex = ((currentPage - 1) * pageItems);
				var endIndex = Math.min (startIndex+pageItems, totalItems);

				var pageIndexes = [];

				if (currentPage <= 3) 
					for (var i=1; i<=6; i++)
						if (i > totalPages) break;
						else pageIndexes.push (i);
				else if (currentPage == totalPages)
					for (var i= totalPages-5; i<=totalPages; i++)
						pageIndexes.push (i);
				else {
					for (var i=currentPage-3; i<=currentPage; i++)
						pageIndexes.push (i);
					for (var i=currentPage+1;i<=currentPage+2; i++)
						if (i > totalPages)
							break;
						else pageIndexes.push (i);
				}
				return {
					totalPages: totalPages,
					currentPage: currentPage,
					pageItems: pageItems,
					startIndex: startIndex,
					endIndex: endIndex,
					pages: pageIndexes
				};

			}
		}
	}
})();