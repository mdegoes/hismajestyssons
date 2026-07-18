PORT ?= 8000
PIDFILE := .server.pid
LOGFILE := .server.log

.PHONY: start stop restart status

start:
	@if [ -f $(PIDFILE) ] && kill -0 $$(cat $(PIDFILE)) 2>/dev/null; then \
		echo "Already running (pid $$(cat $(PIDFILE))) at http://localhost:$(PORT)"; \
	else \
		python3 -m http.server $(PORT) > $(LOGFILE) 2>&1 & echo $$! > $(PIDFILE); \
		echo "Started at http://localhost:$(PORT) (pid $$(cat $(PIDFILE)))"; \
	fi

stop:
	@if [ -f $(PIDFILE) ] && kill -0 $$(cat $(PIDFILE)) 2>/dev/null; then \
		kill $$(cat $(PIDFILE)) && rm -f $(PIDFILE); \
		echo "Stopped"; \
	else \
		echo "Not running"; \
		rm -f $(PIDFILE); \
	fi

restart: stop start

status:
	@if [ -f $(PIDFILE) ] && kill -0 $$(cat $(PIDFILE)) 2>/dev/null; then \
		echo "Running (pid $$(cat $(PIDFILE))) at http://localhost:$(PORT)"; \
	else \
		echo "Not running"; \
	fi
