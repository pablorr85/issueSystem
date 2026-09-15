from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self) -> None:
        import core.signals

        # Python 3.14 compatibility patch for Django 4.2 template context copying
        import sys
        if sys.version_info >= (3, 14):
            from django.template.context import BaseContext
            def _base_context_copy(self):
                duplicate = object.__new__(self.__class__)
                duplicate.__dict__.update(self.__dict__)
                duplicate.dicts = self.dicts[:]
                return duplicate
            BaseContext.__copy__ = _base_context_copy


