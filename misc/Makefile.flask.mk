# *** FLASK ***

.PHONY: run-flask
run-flask:  ## Run flask application with debugger
	$(ACTIVATE) && FLASK_DEBUG=1 flask run --debugger
