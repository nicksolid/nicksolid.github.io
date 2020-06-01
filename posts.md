---
layout: default
title: "Dickson Li | Posts"
---

## Posts

<ul>
  {% for post in site.posts %}
    <li>
      <b><a href="{{ post.url }}">{{ post.title }}</a></b>
      {{ post.excerpt }}
    </li>
  {% endfor %}
</ul>