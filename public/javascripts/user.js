(function() {
	//微博为空时闪红
	$('#addMblog').submit(function() {
		if($('#mAddContent').val()=="") {
			$('#mAddContent').stop(true,true);
			$('#mAddContent').animate({backgroundColor:"rgb(255,184,184)"},"fast");
			$('#mAddContent').animate({backgroundColor:"#fff"},"fast");
			return false;
		}
		return true;
	});
	//hover出删除
	$('.wb').on('mouseover mouseout',function() {
		if (event.type == 'mouseover') {
			$(this).find('.wb_del').show();
			$(this).find('.commentBtn').show();
		} else {
			$(this).find('.wb_del').hide();
			$(this).find('.commentBtn').hide();
		}
	});
	//点击删除按钮
	$('.wb_del').on('click',function() {
		var url = 'http://127.0.0.1:3000/'+'delWB/'+$(this).parents('.wb_wrap').attr('data-wbid');
		$that = $(this);
		if(confirm("确定删除吗？")) {
			$.ajax({
				async:true,
				type:'post',
				url:url,
				dataType:'json',
				success:function(json) {
					if(json.status) {
						$that.parents('.container').remove();
					}
					else {
						alert("删除失败");
					}
				}
			});
		}
	});
	//点击评论按钮
	$('.commentBtn').on('click',function() {
		var url = 'http://127.0.0.1:3000/'+'comment/get/'+ $(this).parents('.wb_wrap').attr('data-wbid');
		$wbWrap = $(this).parents('.wb_wrap');
		if($wbWrap.find('.reply_wrap').css("display")=="none") {
			if($wbWrap.find($('.reply'))) {
				$wbWrap.find($('.reply')).remove();
			}
			$.ajax({
				type:'get',
				dataType:'html',
				url:url,
				success:function(html) {
					$wbWrap.find('.commentFrom').before(html);
					$wbWrap.find('.reply_wrap').slideDown();
				}
			});
		} else {
			$wbWrap.find('.reply_wrap').slideUp();
		}
		
	});

	//点击提交评论
	$('.commentSubmit').on('click',function() {
		var url = 'http://127.0.0.1:3000/'+'comment/add/'+ $(this).parents('.wb_wrap').attr('data-wbid');
		var data ={
			content:$(this).parents('.commentFrom').find('.commentText').val()
		};
		$wbWrap = $(this).parents('.wb_wrap');
		$.ajax({
			type:'post',
			dataType:'html',
			url:url,
			data:data,
			success:function(html) {
				$wbWrap.find('.commentText').val('').before(html);
			}
		});
	});
	//点击取消按钮
	$('.commentCancel').on('click',function() {
		$(this).parents('.reply_wrap').slideUp();
	});
	//按ctrl+enter组合键发布微博
	$('#mAddContent').on('keydown',function(e){
		if (e.ctrlKey && e.keyCode == 13) {
			$('#addMblog').trigger('submit');
			return false;
		}
	});

	//hover出评论删除
	$('.reply_wrap').on('mouseover mouseout','.reply',function() {
		if (event.type == 'mouseover') {
			$(this).find('.reply_del').show();
		} else {
			$(this).find('.reply_del').hide();
		}
	});
	//删除评论
	$('.reply_wrap').on('click','.reply_del',function() {
		var url = 'http://127.0.0.1:3000/'+'comment/del/'+$(this).parents('.reply').attr('data-commentId');
		console.log(url);
		$that = $(this);		
		if(confirm("确定删除吗？")) {
			$.ajax({
				type:'post',
				dataType:'json',
				url:url,
				success:function(json) {
					if(json.status) {
						$that.parents('.reply').slideUp('nomal',function() {
							$(this.remove());
						});
					}
				}
			});
		}
	});
})(jQuery);