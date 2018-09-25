FROM fluent/fluentd:v0.12-onbuild

RUN apk add --update --virtual .build-deps \
        sudo build-base ruby-dev \
 && sudo gem install \
        fluent-plugin-rewrite \
 && sudo gem install \
        fluent-plugin-rewrite-tag-filter \
 && sudo gem install \
        fluent-plugin-slack \
 && sudo gem sources --clear-all \
 && apk del .build-deps \
 && rm -rf /var/cache/apk/* \
           /home/fluent/.gem/ruby/2.4.0/cache/*.gem
