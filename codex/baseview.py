# -*- coding: utf-8 -*-
#
import json
import logging

from django.http import HttpResponse
from django.views.generic import View

from codex.baseerror import BaseError, InputError


__author__ = "Epsirom"


class BaseView(View):

    logger = logging.getLogger('View')

    def dispatch(self, request, *args, **kwargs):
        self.request = request
        return self.do_dispatch(*args, **kwargs)

    def do_dispatch(self, *args, **kwargs):
        raise NotImplementedError('You should implement do_dispatch() in sub-class of BaseView')

    def http_method_not_allowed(self, *args, **kwargs):
        return super(BaseView, self).http_method_not_allowed(self.request, *args, **kwargs)


class APIView(BaseView):

    logger = logging.getLogger('API')

    def do_dispatch(self, *args, **kwargs):
        self.input = self.query or self.body
        handler = getattr(self, self.request.method.lower(), None)
        if not callable(handler):
            return self.http_method_not_allowed()
        return self.api_wrapper(handler, *args, **kwargs)

    @property
    def body(self):
        return json.loads(self.request.body.decode() or '{}')

    @property
    def query(self):
        d = getattr(self.request, self.request.method, None)
        if d:
            d = d.dict()
        else:
            d = dict()
        d.update(self.request.FILES)
        return d

    def api_wrapper(self, func, *args, **kwargs):
        code = 0
        msg = ''
        result = None
        try:
            result = func(*args, **kwargs)
        except BaseError as e:
            code = e.code
            msg = e.msg
            self.logger.exception('Error occurred when requesting %s: %s', self.request.path, e)
        except Exception as e:
            code = -1
            msg = str(e)
            self.logger.exception('Error occurred when requesting %s: %s', self.request.path, e)
        try:
            response = json.dumps({
                'code': code,
                'msg': msg,
                'data': result,
            })
        except:
            self.logger.exception('JSON Serializing failed in requesting %s', self.request.path)
            code = -1
            msg = 'Internal Error'
            response = json.dumps({
                'code': code,
                'msg': msg,
                'data': None,
            })
        return HttpResponse(response, content_type='application/json')

    def check_input(self, *keys):
        for k in keys:
            if k not in self.input:
                raise InputError('Field "%s" required' % (k, ))
